import styles from "./VideoEmbed.module.css";

// Embedded with <iframe> rather than <video> per the Assessment 1 marker
// feedback ("try to use iFrames instead of Video tags"). The browser
// provides its own player chrome inside the frame; the link underneath
// keeps the clip reachable if the frame is blocked or fails to load.
export default function VideoEmbed({
  src,
  title,
  href = src,
}: {
  src: string;
  title: string;
  /** Where "open directly" points, if different from the embed src — e.g. a
   *  YouTube watch URL rather than its /embed/ path. */
  href?: string;
}) {
  return (
    <>
      <iframe
        className={styles.video}
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      <p className={styles.fallback}>
        Trouble viewing it? <a href={href}>Open the video directly</a>.
      </p>
    </>
  );
}
