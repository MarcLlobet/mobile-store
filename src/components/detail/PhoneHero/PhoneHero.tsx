import Image from "next/image";
import styles from "./PhoneHero.module.css";

/**
 * Large hero image for the Detail view. Purely presentational — the caller
 * (PhoneDetailView) owns the selected-color state and passes down an
 * already-`normalizeImageUrl`-d src, swapping it whenever the color
 * selection changes. Alt text is the phone name, per the brief's a11y
 * requirement for the hero image specifically.
 */
export interface PhoneHeroProps {
  imageUrl: string;
  name: string;
}

export function PhoneHero({ imageUrl, name }: PhoneHeroProps) {
  return (
    <div className={styles.wrapper}>
      <Image
        key={imageUrl}
        src={imageUrl}
        alt={name}
        fill
        className={styles.image}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
    </div>
  );
}
