import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownText({ children, className = "" }) {
  return (
    <div className={`space-y-2 break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 underline" />,
          code: ({ node, ...props }) => <code {...props} className="rounded bg-slate-100 px-1 py-0.5" />,
          blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-4 border-slate-300 pl-3 italic" />,
          ul: ({ node, ...props }) => <ul {...props} className="ml-5 list-disc" />,
          ol: ({ node, ...props }) => <ol {...props} className="ml-5 list-decimal" />,
        }}
      >
        {String(children || "")}
      </ReactMarkdown>
    </div>
  );
}
