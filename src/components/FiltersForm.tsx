import { Button, Checkbox, TextInputField, Pane, FormField, TextareaField } from 'evergreen-ui';
import React from 'react';
import { Controller, UseFormMethods } from 'react-hook-form';

import { Difficulty } from '../constants';
import { FiltersFormData } from '../types';
import DurationInput from './DurationInput';

interface FiltersFormProps extends UseFormMethods {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onStop: React.MouseEventHandler<HTMLButtonElement>;
  onReset: React.MouseEventHandler<HTMLButtonElement>;
  onExport: React.MouseEventHandler<HTMLButtonElement>;
  initialState: FiltersFormData;
}

const FiltersForm: React.FC<FiltersFormProps> = ({
  initialState,
  onSubmit,
  onStop,
  onReset,
  onExport,
  register,
  control,
  formState,
}) => (
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
      <Controller
        control={control}
        name="minDuration"
        defaultValue={initialState.minDuration}
        render={props => (
          <DurationInput {...props}>
            <TextInputField
              label="Minimum Duration"
              placeholder="Minimum Duration"
              width={200}
              marginRight={16}
            />
          </DurationInput>
        )}
      />
      <Controller
        control={control}
        name="maxDuration"
        defaultValue={initialState.maxDuration}
        render={props => (
          <DurationInput {...props}>
            <TextInputField
              label="Maximum Duration"
              placeholder="Maximum Duration"
              width={200}
            />
          </DurationInput>
        )}
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
      name="download"
      defaultValue={false}
      render={({ onChange, value, ref }) => (
        <Checkbox
          label="Automatically download beatmaps?"
          onChange={e => onChange(e.target.checked)}
          checked={value}
          ref={ref}
        />
      )}
    />
    <Pane display="flex" justifyContent={formState.isSubmitted ? 'space-between' : 'flex-start'}>
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
        marginRight={16}
      >
        Reset
      </Button>
      {formState.isSubmitted && (
        <Button onClick={onExport}>
          Export as playlist
        </Button>
      )}
    </Pane>
  </form>
);

export default FiltersForm;
