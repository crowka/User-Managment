export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LayoutProps extends BaseProps {
  title?: string;
  description?: string;
}

export interface ButtonProps extends BaseProps {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  onClick?: () => void;
}