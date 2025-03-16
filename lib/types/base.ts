export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LayoutProps extends BaseProps {
  title?: string;
  description?: string;
} 