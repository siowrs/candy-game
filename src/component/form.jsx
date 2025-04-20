import { createContext, useContext, useEffect, useState } from "react";

const FormContext = createContext();

function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within Form component.");
  }

  return context;
}

export function Form({ initialValues, onSubmit, children, ...props }) {
  const [formData, setFormData] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <FormContext.Provider value={{ formData, setFormData, handleChange }}>
      <form className="space-y-4" onSubmit={(e) => handleSubmit(e)} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

Form.Label = function FormLabel({ htmlFor, label, ...props }) {
  return (
    <label className="form-label" htmlFor={htmlFor} {...props}>
      {label}
    </label>
  );
};

Form.Description = function FormDescription({ children, ...props }) {
  return (
    <p className="form-desc" {...props}>
      {children}
    </p>
  );
};

Form.Error = function FormError({ error, ...props }) {
  return (
    <p className="form-error" {...props}>
      {error}
    </p>
  );
};

Form.Input = function FormInput({ name, ...props }) {
  const { formData, handleChange } = useFormContext();
  return (
    <input
      className="form-input"
      name={name}
      id={name}
      value={formData?.[name] || ""}
      onChange={handleChange}
      {...props}
    />
  );
};

Form.Select = function FormSelect({ name, children, ...props }) {
  const { formData, handleChange } = useFormContext();

  return (
    <select
      className="form-select"
      name={name}
      id={name}
      value={formData?.[name] || ""}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  );
};

Form.Option = function FormOption({ value, label }) {
  return <option value={value}>{label}</option>;
};
