"use client";

import Editor from "react-simple-wysiwyg";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  return (
    <div className="bg-background rounded-md border border-input">
      <Editor
        value={value}
        onChange={(e) => onChange(e.target.value)}
        containerProps={{ style: { resize: "vertical" } }}
      />
    </div>
  );
}
