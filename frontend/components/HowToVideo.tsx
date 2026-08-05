import styles from "./HowToVideo.module.css";

// Shared by the About page and the Assessment 1 page — same clip, same
// fallback link, no duplication between the two places it's required to appear.
//
// Embedded with <iframe> rather than <video> per the Assessment 1 feedback. The
// browser provides its own player chrome inside the frame; the link underneath
// keeps the clip reachable if the frame is blocked or fails to load.
export default function HowToVideo() {
  return (
    <>
      <iframe
        className={styles.video}
        src="/videos/how-to.mp4"
        title="Video walkthrough of how to use this website"
        loading="lazy"
        allow="fullscreen"
      />
      <p className={styles.fallback}>
        Trouble viewing it?{" "}
        <a href="/videos/how-to.mp4">Open the walkthrough video directly</a>.
      </p>
    </>
  );
}
