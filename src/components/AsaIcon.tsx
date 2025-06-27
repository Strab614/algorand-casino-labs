interface AsaIconProps {
  asaId: bigint | number;
  size?: number;
}

const AsaIcon = ({ asaId, size = 24 }: AsaIconProps) => {
  return (
    <img
      loading="lazy"
      src={`https://asa-list.tinyman.org/assets/${Number(asaId)}/icon.png`}
      alt="asa icon"
      height={`${size}px`}
      width={`${size}px`}
    />
  );
};

export default AsaIcon;
