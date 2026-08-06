import styles from "./HowToVideo.module.css";

// Shared by the About page and the Assessment 1 page — same clip, same
// fallback text, no duplication between the two places it's required to appear.
export default function HowToVideo() {
  return (
    <video
      className={styles.video}
      controls
      preload="metadata"
      aria-label="Video walkthrough of how to use this website"
    >
      <source src="/videos/how-to.mp4" type="video/mp4" />
      Your browser does not support embedded video. The walkthrough video is
      available at /videos/how-to.mp4.
    </video>
  );
}
