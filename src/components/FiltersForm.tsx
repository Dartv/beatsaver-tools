import { Button, Checkbox, TextInputField, Pane, FormField, TextareaField } from 'evergreen-ui';
import React from 'react';
import { Controller, UseFormMethods } from 'react-hook-form';

import { Difficulty, DifficultyFormData } from '../constants';

export interface FiltersFormData extends DifficultyFormData {
  minUpvotes: number;
  maxDownvotes: number;
  minDownloads: number;
  minRating: number;
  minDuration: string;
  maxDuration: string;
  makePlaylist: boolean;
  excludedMappers: string;
  playlistName: string;
}

interface FiltersFormProps extends UseFormMethods {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onStop: React.MouseEventHandler<HTMLButtonElement>;
  onReset: React.MouseEventHandler<HTMLButtonElement>;
  initialState: FiltersFormData;
}

const FiltersForm: React.FC<FiltersFormProps> = ({
  initialState,
  onSubmit,
  onStop,
  onReset,
  register,
  control,
  watch,
}) => {
  const makePlaylist = watch('makePlaylist', initialState.makePlaylist);

  return (
    <form onSubmit={onSubmit}>
      <Pane display="flex">
        <TextInputField
          label="Minimum upvotes"
          placeholder="Minimum upvotes"
          name="minUpvotes"
          type="number"
          defaultValue={initialState.minUpvotes}
          min={0}
          ref={register({ valueAsNumber: true, min: 0 })}
          width={200}
          marginRight={16}
        />
        <TextInputField
          label="Maximum downvotes"
          placeholder="Maximum downvotes"
          name="maxDownvotes"
          type="number"
          defaultValue={initialState.maxDownvotes}
          min={0}
          ref={register({ valueAsNumber: true, min: 0 })}
          width={200}
        />
      </Pane>
      <Pane display="flex">
        <TextInputField
          label="Minimum downloads"
          placeholder="Minimum downloads"
          name="minDownloads"
          type="number"
          defaultValue={initialState.minDownloads}
          min={0}
          ref={register({ valueAsNumber: true, min: 0 })}
          width={200}
          marginRight={16}
        />
        <TextInputField
          label="Minimum rating"
          placeholder="Minimum rating"
          name="minRating"
          type="number"
          defaultValue={initialState.minRating}
          min={0}
          max={100}
          ref={register({ valueAsNumber: true, min: 0, max: 100 })}
          width={200}
        />
      </Pane>
      <Pane display="flex">
        <TextInputField
          label="Minimum Duration"
          placeholder="Minimum Duration"
          name="minDuration"
          type="time"
          step="1"
          defaultValue={initialState.minDuration}
          ref={register()}
          width={200}
          marginRight={16}
        />
        <TextInputField
          label="Maximum Duration"
          placeholder="Maximum Duration"
          name="maxDuration"
          type="time"
          step="1"
          defaultValue={initialState.maxDuration}
          ref={register()}
          width={200}
        />
      </Pane>
      <TextareaField
        label="Exclude mappers"
        placeholder="John, Eric"
        name="excludedMappers"
        defaultValue={initialState.excludedMappers}
        ref={register({ setValueAs: value => value.toLowerCase() })}
        width={420}
      />
      <FormField label="Difficulty">
        <Pane display="flex">
          {Object.entries(Difficulty).map(([key, value], i, arr) => (
            <Controller
              key={value}
              control={control}
              name={value}
              defaultValue={initialState[value]}
              render={({ onChange, value, ref }) => (
                <Checkbox
                  label={key.replace('_', ' ')}
                  onChange={e => onChange(e.target.checked)}
                  checked={value}
                  marginRight={i === arr.length - 1 ? 0 : 16}
                  marginTop={4}
                  ref={ref}
                />
              )}
            />
          ))}
        </Pane>
      </FormField>
      <Controller
        control={control}
        name="makePlaylist"
        defaultValue={initialState.makePlaylist}
        render={({ onChange, value, ref }) => (
          <Checkbox
            label="Make a playlist?"
            onChange={e => onChange(e.target.checked)}
            checked={value}
            ref={ref}
          />
        )}
      />
      {makePlaylist && (
        <TextInputField
          label="Playlist name"
          placeholder="Playlist name"
          name="playlistName"
          defaultValue={initialState.playlistName}
          ref={register()}
          width={200}
        />
      )}
      <Pane>
        <Button
          type="submit"
          appearance="primary"
          marginRight={16}
        >
          Apply
        </Button>
        <Button
          intent="warning"
          appearance="primary"
          marginRight={16}
          onClick={onStop}
        >
          Stop
        </Button>
        <Button
          intent="danger"
          appearance="primary"
          onClick={onReset}
        >
          Reset
        </Button>
      </Pane>
    </form>
  );
};

export default FiltersForm;
