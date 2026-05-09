<script lang="ts">
  export let width = 16;
  export let height = 16;
  export let color = 'white';
</script>
<svg {width} {height} viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle">
  <path
    fill="none"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-dasharray="56"
    stroke-dashoffset="56"
    d="M5 19v0c-0.3 0 -0.59 -0.15 -0.74 -0.41c-0.8 -1.34 -1.26 -2.91 -1.26 -4.59c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 1.68 -0.46 3.25 -1.26 4.59c-0.15 0.26 -0.44 0.41 -0.74 0.41Z">
    <animate attributeName="stroke-dashoffset" dur="0.6s" values="56;0" fill="freeze" />
  </path>
  <path
    fill={color}
    opacity="0"
    d="M12 14c0 0 0 0 0 0c0 0 0 0 0 0c0 0 0 0 0 0c0 0 0 0 0 0Z"
    transform="rotate(-100 12 14)">
    <set attributeName="opacity" begin="0.6s" to="1" fill="freeze" />
    <animate attributeName="d" begin="0.6s" dur="0.2s" fill="freeze"
      values="M12 14c0 0 0 0 0 0c0 0 0 0 0 0c0 0 0 0 0 0c0 0 0 0 0 0Z;M14 14c0 1.1 -0.9 2 -2 2c-1.1 0 -2 -0.9 -2 -2c0 -1.1 2 -10 2 -10c0 0 2 8.9 2 10Z" />
    <animateTransform attributeName="transform" begin="0.8s" dur="6s" keyTimes="0;0.08;0.2;0.28;0.36;0.44;0.52;0.6;0.68;0.76;0.84;0.92;1" repeatCount="indefinite" type="rotate" values="-100 12 14;45 12 14;45 12 14;20 12 14;10 12 14;0 12 14;35 12 14;45 12 14;55 12 14;50 12 14;15 12 14;-20 12 14;-100 12 14"/>
  </path>
</svg>