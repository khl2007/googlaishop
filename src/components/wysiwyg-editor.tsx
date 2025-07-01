"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useMemo } from "react";
import { Skeleton } from "./ui/skeleton";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false, loading: () => <Skeleton className="h-[200px] w-full rounded-md" /> }),
    []
  );

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <div className="bg-background">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
      />
    </div>
  );
}
