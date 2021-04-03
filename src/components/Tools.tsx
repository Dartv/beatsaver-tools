import React, { useEffect, useRef, useState } from 'react';
import { Pane, IconButton, SideSheet, Heading, Paragraph, Tablist, Tab } from 'evergreen-ui';
import { useForm } from 'react-hook-form';

import FiltersForm, { FiltersFormData } from './FiltersForm';
import { Difficulty, initialFilters } from '../constants';
import { parseIntFromNode, parseTimeFromNode, parseTimeToSeconds } from '../utils/common';

const tabs = ['Filters'];
const descriptions = [
  'Pick settings below to filter maps based on'
];

const getInitialFilters = (): FiltersFormData => {
  try {
    const state = localStorage.getItem('bt-filters') || '';
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
  const filter = (node: Element) => {
    const formData = { ...initialFilters, ...filtersFormData.current };
    const upvotes = parseIntFromNode(node.querySelector(`li[title="Upvotes"]`)) || initialFilters.minUpvotes;
    const downvotes = parseIntFromNode(node.querySelector(`li[title="Downvotes"]`)) || initialFilters.maxDownvotes;
    const downloads = parseIntFromNode(node.querySelector(`li[title="Downloads"]`)) || initialFilters.minDownloads;
    const rating = parseIntFromNode(node.querySelector(`li[title="Beatmap Rating"]`)) || initialFilters.minRating;
    const duration = parseTimeFromNode(node.querySelector(`li[title="Beatmap Duration"]`)) || initialFilters.minDuration;
    const hasDifficulty = Object.values(Difficulty).some(
      difficulty => formData[difficulty] && node.querySelector(`.tag.${difficulty}`)
    );
    const predicate = [
      hasDifficulty,
      upvotes >= formData.minUpvotes,
      downvotes <= formData.maxDownvotes,
      downloads >= formData.minDownloads,
      rating >= formData.minRating,
      duration >= parseTimeToSeconds(formData.minDuration),
      duration <= parseTimeToSeconds(formData.maxDuration),
    ].every(Boolean);

    if (!predicate) {
      node.parentNode?.removeChild(node);
    }
  };
  const filterAll = () => {
    const nodes = Array.from(document.querySelectorAll('.beatmap-result:not(.beatmap-result-hidden)'));
    nodes.forEach(filter);
  };
  const onSubmitFilters = () => {
    filtersFormData.current = filtersForm.getValues();

    filterAll();

    observer.current?.disconnect();
    observer.current?.observe(document.documentElement, {
      subtree: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
    });

    localStorage.setItem('bt-filters', JSON.stringify(filtersFormData.current));
  };
  const onFiltersSubmit = filtersForm.handleSubmit(onSubmitFilters);
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
  };

  useEffect(() => {
    observer.current = new MutationObserver((mutations) => {
      mutations.forEach(({ type, target, oldValue }) => {
        if (type === 'attributes' && oldValue === 'beatmap-result-hidden') {
          filter(target as Element);
        }
      });
    });

    return () => observer.current?.disconnect();
  }, []);

  return (
    <>
      <SideSheet
        isShown={isShown}
        onCloseComplete={() => setIsShown(!isShown)}
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
        position="absolute"
        top={75}
        right={15}
        icon={<img src="https://cdn.discordapp.com/emojis/448732050636275722.png?v=1" alt="Beat saber icon" />}
        onClick={() => setIsShown(true)}
      />
    </>
  );
};

export default Tools;
