import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export function EmptyDoctorsIllustration() {
  return (
    <Svg width={140} height={140} viewBox="0 0 140 140" fill="none">
      <Rect
        x={28}
        y={20}
        width={84}
        height={100}
        rx={6}
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth={2}
      />
      <Line
        x1={42}
        y1={36}
        x2={70}
        y2={36}
        stroke="#5CCEF7"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Line
        x1={42}
        y1={48}
        x2={98}
        y2={48}
        stroke="#E6E6E6"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1={42}
        y1={58}
        x2={88}
        y2={58}
        stroke="#E6E6E6"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1={42}
        y1={68}
        x2={76}
        y2={68}
        stroke="#E6E6E6"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={72} cy={74} r={26} fill="#FFFFFF" stroke="#000000" strokeWidth={2} />
      <Circle cx={72} cy={74} r={22} fill="#E6F5FE" fillOpacity={0.5} />
      <Circle
        cx={72}
        cy={74}
        r={16}
        stroke="#5CCEF7"
        strokeWidth={2}
        strokeDasharray="3 3"
      />
      <Path
        d="M88 90L108 110"
        stroke="#000000"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M64 74H80"
        stroke="#000000"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
