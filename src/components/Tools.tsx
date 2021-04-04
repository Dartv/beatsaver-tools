import React, { useEffect, useRef, useState } from 'react';
import { Pane, IconButton, SideSheet, Heading, Paragraph, Tablist, Tab, toaster } from 'evergreen-ui';
import { useForm } from 'react-hook-form';

import FiltersForm from './FiltersForm';
import { Difficulty, initialFilters, FILTERS_KEY } from '../constants';
import { downloadFile, getInitialFilters, parseBeatmapFromNode, parseTimeToSeconds } from '../utils/common';
import { Beatmap, FiltersFormData } from '../types';

const tabs = ['Filters'];
const descriptions = [
  'Pick settings below to filter maps based on'
];
const logo = window.GM_getResourceURL('logo');

const passesFilters = (map: Beatmap, filters: FiltersFormData) => {
  const hasDifficulty = Object.values(Difficulty).some(
    difficulty => filters[difficulty] && map.difficulties.includes(difficulty)
  );
  return [
    hasDifficulty,
    map.upvotes >= filters.minUpvotes,
    map.downvotes <= filters.maxDownvotes,
    map.downloads >= filters.minDownloads,
    map.rating >= filters.minRating,
    map.duration >= parseTimeToSeconds(filters.minDuration),
    map.duration <= parseTimeToSeconds(filters.maxDuration),
    !filters.excludedMappers.split(',').map(m => m.trim()).includes(map.author.toLowerCase()),
  ].every(Boolean);
};

const Tools: React.FC = () => {
  const [isShown, setIsShown] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const observer = useRef<MutationObserver>();
  const filtersForm = useForm<FiltersFormData>();
  const filtersFormData = useRef<FiltersFormData>(getInitialFilters());
  const maps = useRef<Map<string, Beatmap>>(new Map());
  const getFilters = () => ({ ...initialFilters, ...filtersFormData.current });
  const filter = (node: Element) => {
    const filters = getFilters();
    const map = parseBeatmapFromNode(node);

    if (!passesFilters(map, filters)) {
      node.setAttribute('style', 'display: none;');
    }

    if (map.hash) {
      maps.current.set(map.id, map);
    }
  };
  const filterAll = () => {
    const filters = getFilters();
    const nodes = Array.from(document.querySelectorAll('.beatmap-result:not(.beatmap-result-hidden)'));

    nodes.forEach(filter);

    maps.current.forEach((map) => {
      if (passesFilters(map, filters)) {
        const node = document.getElementById(map.id);

        node?.removeAttribute('style');
      }
    });
  };
  const onSubmitFilters = () => {
    filtersFormData.current = filtersForm.getValues();

    filterAll();

    observer.current?.disconnect();
    observer.current?.observe(document.documentElement, {
      subtree: true,
      attributeFilter: ['class', 'src'],
      attributeOldValue: true,
    });

    localStorage.setItem(FILTERS_KEY, JSON.stringify(filtersFormData.current));
  };
  const onFiltersSubmit = filtersForm.handleSubmit(() => {
    onSubmitFilters();

    setIsShown(false);

    toaster.notify('Beatmaps that do not pass filters will get filtered out. Click "stop" to cancel.');
  });
  const onFiltersStop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    observer.current?.disconnect();
  };
  const onFiltersReset = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // can't use reset here because of the bug in react-hook-form
    Object.entries(initialFilters).forEach(([key, value]) => {
      filtersForm.setValue(key as keyof FiltersFormData, value);
    });

    onSubmitFilters();

    maps.current.clear();

    observer.current?.disconnect();
  };
  const onFiltersExport = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const playlistTitle = window.prompt('Enter playlist name');

    if (playlistTitle) {
      const hashes = new Set<string>();
      const filters = { ...initialFilters, ...filtersForm.getValues() };

      maps.current.forEach((map) => {
        if (map.hash && passesFilters(map, filters)) {
          hashes.add(map.hash);
        }
      });

      if (hashes.size) {
        const date = new Date();
        const createdAt = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        const playlistData = {
          playlistTitle,
          playlistAuthor: 'Beatsaver Tools',
          playlistDescription: `Playlist created by Beatsaver Tools at ${createdAt}`,
          image: logo,
          songs: Array.from(hashes).map(hash => ({ hash })),
        };

        downloadFile(`${playlistTitle}.json`, JSON.stringify(playlistData));
      }
    }
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
            onExport={onFiltersExport}
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
