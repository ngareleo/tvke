import { type FC, Suspense } from "react";

import { ProfilesPageContent } from "./ProfilesPageContent.js";

const ProfilesPage: FC = () => (
  <Suspense fallback={null}>
    <ProfilesPageContent />
  </Suspense>
);

export default ProfilesPage;
