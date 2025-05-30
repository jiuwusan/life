import React, { useState, useContext } from 'react';

export interface FormContextProps {
  values: Record<string, any>;
  setFieldValue: (name: string, value: any) => void;
}

export const FormContext = React.createContext<FormContextProps | null>(null);

export interface FormProps {
  onFinish?: (values: Record<string, any>) => void;
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ onFinish, children }) => {
  const [values, setValues] = useState<Record<string, any>>({});

  const setFieldValue = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFinish?.(values);
  };

  return (
    <FormContext.Provider value={{ values, setFieldValue }}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  );
};

export interface FormItemProps {
  name: string;
  children: React.ReactElement;
}

export const FormItem: React.FC<FormItemProps> = ({ name, children }) => {
  const context = useContext(FormContext);
  if (!context) throw new Error('FormItem must be used inside Form');

  const { values, setFieldValue } = context;

  const handleChange = (e: any) => {
    const value = e?.target?.value ?? e;
    setFieldValue(name, value);
  };

  const child = React.cloneElement(children, {
    value: values[name] ?? '',
    onChange: handleChange
  });

  return <div style={{ marginBottom: 16 }}>{child}</div>;
};


