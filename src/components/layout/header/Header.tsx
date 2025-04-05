import Menu from './Menu';

export type HeaderProps = {
  ghost?: boolean;
};

function Header({ ghost }: HeaderProps) {
  return <Menu />;
}

export default Header;
