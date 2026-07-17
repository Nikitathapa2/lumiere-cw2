import Image from 'next/image';


export default function AuthSplit({
  image = 'https://picsum.photos/seed/lumiere-auth/1000/1400',
  overlayTitle,
  overlayText,
  children,
}) {
  return (
    <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src={image} alt="" fill sizes="50vw" priority className="object-cover grayscale" />
        {overlayTitle ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-12 text-on-dark">
              <h2 className="font-serif text-5xl leading-[1.05]">{overlayTitle}</h2>
              {overlayText ? (
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-on-dark/80">{overlayText}</p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-center px-6 py-16 md:px-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
