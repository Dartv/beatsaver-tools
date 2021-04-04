import React from 'react';
import MaskedInput from 'react-input-mask';
import { ControllerRenderProps } from 'react-hook-form';

interface DurationInputProps extends ControllerRenderProps {
  children: React.ReactElement;
}

const DurationInput: React.FC<DurationInputProps> = ({ value, name, onChange, ref, children }) => (
  <MaskedInput
    value={value}
    name={name}
    mask="23:59:59"
    maskChar="0"
    alwaysShowMask
    formatChars={{
      2: '[0-2]',
      3: '[0-3]',
      5: '[0-5]',
      9: '[0-9]',
    }}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
      e.persist();
      onChange(e.target.value);
    }}
  >
    {(inputProps: any) => React.cloneElement(children, { ...inputProps, ref })}
  </MaskedInput>
);

export default DurationInput;
