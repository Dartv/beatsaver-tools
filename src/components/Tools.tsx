import React, { useEffect, useRef, useState } from 'react';
import { Pane, IconButton, SideSheet, Heading, Paragraph, Tablist, Tab, toaster } from 'evergreen-ui';
import { useForm } from 'react-hook-form';

import FiltersForm, { FiltersFormData } from './FiltersForm';
import { Difficulty, initialFilters, FILTERS_KEY } from '../constants';
import {
  downloadFile,
  getBeatmapIdFromImage,
  getTextFromNode,
  parseIntFromNode,
  parseTimeFromNode,
  parseTimeToSeconds,
} from '../utils/common';

const tabs = ['Filters'];
const descriptions = [
  'Pick settings below to filter maps based on'
];
const logo = window.GM_getResourceURL('logo');

const getInitialFilters = (): FiltersFormData => {
  try {
    const state = localStorage.getItem(FILTERS_KEY) || '';
    return JSON.parse(state);
  } catch (err) {
    return initialFilters;
  }
};

const Tools: React.FC = () => {
  const [isShown, setIsShown] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const observer = useRef<MutationObserver>();
  const filtersForm = useForm<FiltersFormData>();
  const filtersFormData = useRef<FiltersFormData>(getInitialFilters());
  const playlist = useRef<Set<string>>(new Set());
  const filter = (node: Element) => {
    const filters = { ...initialFilters, ...filtersFormData.current };
    const upvotes = parseIntFromNode(node.querySelector(`li[title="Upvotes"]`)) || initialFilters.minUpvotes;
    const downvotes = parseIntFromNode(node.querySelector(`li[title="Downvotes"]`)) || initialFilters.maxDownvotes;
    const downloads = parseIntFromNode(node.querySelector(`li[title="Downloads"]`)) || initialFilters.minDownloads;
    const rating = parseIntFromNode(node.querySelector(`li[title="Beatmap Rating"]`)) || initialFilters.minRating;
    const duration = parseTimeFromNode(node.querySelector(`li[title="Beatmap Duration"]`)) || initialFilters.minDuration;
    const author = getTextFromNode(node.querySelector('.details > h2 > a')) || '';
    const hasDifficulty = Object.values(Difficulty).some(
      difficulty => filters[difficulty] && node.querySelector(`.tag.${difficulty}`)
    );
    const predicate = [
      hasDifficulty,
      upvotes >= filters.minUpvotes,
      downvotes <= filters.maxDownvotes,
      downloads >= filters.minDownloads,
      rating >= filters.minRating,
      duration >= parseTimeToSeconds(filters.minDuration),
      duration <= parseTimeToSeconds(filters.maxDuration),
      !filters.excludedMappers.split(',').map(m => m.trim()).includes(author.toLowerCase()),
    ].every(Boolean);

    if (!predicate) {
      node.setAttribute('style', 'display: none;');
    } else if (filters.makePlaylist) {
      const beatmapId = getBeatmapIdFromImage(node.querySelector('.cover img'));

      if (beatmapId && beatmapId !== 'placeholder') {
        playlist.current.add(beatmapId);
      }
    }
  };
  const filterAll = () => {
    const nodes = Array.from(document.querySelectorAll('.beatmap-result:not(.beatmap-result-hidden)'));
    nodes.forEach(filter);
  };
  const onSubmitFilters = (filters: FiltersFormData) => {
    filtersFormData.current = filters;

    filterAll();

    observer.current?.disconnect();
    observer.current?.observe(document.documentElement, {
      subtree: true,
      attributeFilter: ['class', 'src'],
      attributeOldValue: true,
    });

    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  };
  const onFiltersSubmit = filtersForm.handleSubmit(() => {
    const filters = filtersForm.getValues();

    onSubmitFilters(filters);

    if (filters.makePlaylist) {
      toaster.notify('Playlist will be created when you click "stop"');
    }
  });
  const onFiltersStop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    observer.current?.disconnect();

    if (playlist.current.size) {
      const formData = filtersForm.getValues();
      const date = new Date();
      const createdAt = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      const playlistName = formData.playlistName || `Playlist created by Beatsaver Tools at ${createdAt}`;
      const playlistData = {
        playlistTitle: 'test',
        playlistAuthor: 'Beatsaver Tools',
        playlistDescription: 'Playlist created by Beatsaver Tools',
        image: logo,
        songs: Array.from(playlist.current).map(hash => ({ hash })),
      };
      downloadFile(playlistName, JSON.stringify(playlistData));

      playlist.current.clear();
    }
  };
  const onFiltersReset = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    playlist.current.clear();

    // can't use reset here because of the bug in react-hook-form
    Object.entries(initialFilters).forEach(([key, value]) => {
      filtersForm.setValue(key as keyof FiltersFormData, value);
    });

    onSubmitFilters(filtersForm.getValues());
  };

  useEffect(() => {
    observer.current = new MutationObserver((mutations) => {
      mutations.forEach(({ type, target, oldValue }) => {
        // beatsaver removes nodes from DOM when it is not visible
        // luckily they set class from beatmap-result-hidden to beatmap-result when map is rendered
        // beatsaver replaces src with placeholder while the map is loading
        if (type === 'attributes' && oldValue === 'beatmap-result-hidden' || oldValue?.includes('placeholder')) {
          const node = target.nodeName === 'IMG' ? (target as Element).closest('.beatmap-result') : target;

          if (node) {
            filter(node as Element);
          }
        }
      });
    });

    return () => observer.current?.disconnect();
  }, []);

  return (
    <>
      <SideSheet
        width={480}
        isShown={isShown}
        onCloseComplete={() => setIsShown(false)}
        containerProps={{
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
          paddingTop: 52,
        }}
      >
        <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
          <Pane padding={16} borderBottom="muted">
            <Heading size={600}>Beatsaver Tools</Heading>
            <Paragraph size={400} color="muted">
              {descriptions[selectedTab]}
            </Paragraph>
          </Pane>
          <Pane display="flex" padding={8}>
            <Tablist>
              {tabs.map((tab, index) => (
                <Tab
                  key={tab}
                  isSelected={selectedTab === index}
                  onSelect={() => setSelectedTab(index)}
                >
                  {tab}
                </Tab>
              ))}
            </Tablist>
          </Pane>
        </Pane>
        <Pane flex="1" overflowY="scroll" padding={16}>
          <FiltersForm
            {...filtersForm}
            onSubmit={onFiltersSubmit}
            onStop={onFiltersStop}
            onReset={onFiltersReset}
            initialState={filtersFormData.current}
          />
        </Pane>
      </SideSheet>
      <IconButton
        appearance="minimal"
        icon={(
          <img src={logo} alt="Beat saber icon" />
        )}
        onClick={() => setIsShown(!isShown)}
      />
    </>
  );
};

export default Tools;
