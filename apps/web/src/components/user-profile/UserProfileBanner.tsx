type UserProfileBannerProps = {
  bannerUrl?: string;
};

export function UserProfileBanner({ bannerUrl }: UserProfileBannerProps) {
  return (
    <div
      className="relative w-full min-h-[160px] max-h-[280px] overflow-hidden bg-surface-container"
      style={{ aspectRatio: "16 / 4" }}
    >
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt="Banner do perfil"
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
