<script lang="ts">
  import styles from "./NavButton.module.css";

  export let label: string;
  export let href: string;
  export let variant: "light" | "dark" = "dark";
  export let backgroundImage: string = "";

  const style: string = backgroundImage
    ? `background-image: url(${backgroundImage})`
    : "";
</script>

<a
  {href}
  class="{styles.btn} {variant === 'light' ? styles.light : styles.dark}"
  {style}
  aria-label={label}
>
  <span class={styles.label}>{label}</span>
</a>
