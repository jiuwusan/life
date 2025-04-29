import { Sticky, type StickyProps } from '../Sticky';

export type PopupProps = {} & StickyProps;

export function Popup(props: PopupProps) {
  const { children, ...rest } = props;

  return <Sticky {...rest}>{children}</Sticky>;
}
