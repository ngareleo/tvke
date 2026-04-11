import React, { type FC, Suspense } from "react";

import { DashboardPageContent } from "./DashboardPageContent.js";

const DashboardPage: FC = () => (
  <Suspense fallback={null}>
    <DashboardPageContent />
  </Suspense>
);

export default DashboardPage;
