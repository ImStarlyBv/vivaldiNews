import { MDXRemote } from 'next-mdx-remote/rsc';

const components = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-serif font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-serif font-semibold mt-6 mb-3 text-gray-900" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-5 text-gray-700 leading-relaxed text-[1.05rem]" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 ml-6 list-disc text-gray-700 space-y-1" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 ml-6 list-decimal text-gray-700 space-y-1" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary-500 pl-5 italic my-6 text-gray-600 bg-gray-50 py-3 pr-4 rounded-r" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary-600 hover:text-primary-700 underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  hr: () => <hr className="my-8 border-gray-200" />,
};

export default function ArticleBody({ source }: { source: string }) {
  return (
    <div className="article-content max-w-none">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
