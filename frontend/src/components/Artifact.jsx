import React from "react";
import Editor from "@monaco-editor/react";

const Artifact = ({ artifact }) => {
  if (!artifact) return null;

  const isCode = artifact.type === "code";
  
  if (isCode) {
    const defaultFile = artifact.files[0];
    const language = defaultFile.name.endsWith(".js") ? "javascript" : 
                     defaultFile.name.endsWith(".css") ? "css" : 
                     defaultFile.name.endsWith(".html") ? "html" : "markdown";

    return (
      <div className="w-96 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full">
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4">
          <span className="font-medium text-zinc-200">{artifact.title}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage={language}
            defaultValue={defaultFile.content}
            options={{
              minimap: { enabled: false },
              wordWrap: "on",
              readOnly: true
            }}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default Artifact;
