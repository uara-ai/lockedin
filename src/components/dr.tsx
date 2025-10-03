import Image from "next/image";
import Link from "next/link";

export default function Dr() {
  return (
    <Link href="https://frogdr.com/uara.co?utm_source=uara.co" target="_blank">
      <Image
        src="https://frogdr.com/uara.co/badge-white-sm.svg?badge=1&round=1&s=n"
        alt="DR Badge"
        width="215"
        height="36"
      ></Image>
    </Link>
  );
}
