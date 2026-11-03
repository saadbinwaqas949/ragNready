"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className = "admin-input", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return <span className="password-input-wrap">
    <input {...props} className={`${className} password-input-field`} type={visible ? "text" : "password"} />
    <button className="password-input-toggle" type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)}>
      {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
    </button>
  </span>;
}
