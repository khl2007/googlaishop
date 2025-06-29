import * as React from "react";

export const Breadcrumb: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <nav aria-label="breadcrumb">{children}</nav>;
};

export const BreadcrumbList: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>{children}</ol>;
};

export const BreadcrumbItem: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <li style={{ display: 'inline-block', marginRight: '0.5em' }}>{children}</li>;
};

export const BreadcrumbLink: React.FC<{ href: string; children?: React.ReactNode }> = ({ href, children }) => {
  return <a href={href}>{children}</a>;
};

export const BreadcrumbPage: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <span aria-current="page">{children}</span>;
};

export const BreadcrumbSeparator: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <span style={{ margin: '0 0.25em' }}>{children || '/'}</span>;
};