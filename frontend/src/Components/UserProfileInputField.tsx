import { OutlinedInput, FormHelperText } from "@mui/material";

interface InputFieldFeatures {
    name: string;
    value: string;
    editing?: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    noDefault?: boolean;
    error?: boolean;
    helperText?: string;
  }
  
  const InputField = ({ name, value, editing, onChange, noDefault, error, helperText } : InputFieldFeatures) => {
    return (
      <>
        <h3>{name}</h3>
        {noDefault ? (
        <>
          <OutlinedInput
            value={value}
            fullWidth
            sx={{ backgroundColor: 'white' }}
            disabled={!editing}
            onChange={onChange}
            error={error}
          />
          {error && <FormHelperText error>{helperText}</FormHelperText>}
        </>
      ) : (
        <>
          <OutlinedInput
            defaultValue={value}
            fullWidth
            sx={{ backgroundColor: 'white' }}
            disabled={!editing}
            onChange={onChange}
            error={error}
          />
          {error && <FormHelperText error>{helperText}</FormHelperText>}
        </>
      )}
    </>
  );
};
  
  export default InputField;
  