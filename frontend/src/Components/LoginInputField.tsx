interface InputFieldFeatures {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  InputProps?: {endAdornment?: React.ReactNode;};
}

const InputField = ({ type, name, placeholder, value, onChange, InputProps } : InputFieldFeatures) => {
  return (
    <>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '85%',
          padding: '5px 10px',
          fontSize: '12px',
          border: '1px solid #E0E0E0',
          borderRadius: '5px',
          boxSizing: 'border-box',
        }}
      />
      {InputProps?.endAdornment && (
        <div style={{ marginLeft: '10px' }}>
          {InputProps.endAdornment}
        </div>
      )}
    </>
  );
};

export default InputField;
