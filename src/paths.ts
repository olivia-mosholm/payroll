import { useLocation } from 'react-router-dom';

function makeVariantPaths(base: string) {
    return {
        base,
        employees: `${base}/employees`,
        employeeReview: `${base}/employees/review`,
        employee: (id: string) => `${base}/employees/${id}`,
        optionsPreview: `${base}/employees/options-preview`,
        employeeGroups: `${base}/employees/groups`,
        payrollOverview: `${base}/payroll/overview`,
        payrollRuns: `${base}/payroll/runs`,
        payrollArchive: `${base}/payroll/archive`,
        reportsVacation: `${base}/reports/vacation`,
        settingsCompany: `${base}/settings/company`,
    };
}

export type VariantPaths = ReturnType<typeof makeVariantPaths>;

export const PATHS = {
    landing: '/',
    onboardingV1: makeVariantPaths('/onboarding-v1'),
    onboardingV2: makeVariantPaths('/onboarding-v2'),
    scheduledChangesV1: makeVariantPaths('/scheduled-changes-v1'),
};

export const ONBOARDING_V1_PREFIX = PATHS.onboardingV1.base;
export const ONBOARDING_V2_PREFIX = PATHS.onboardingV2.base;
export const SCHEDULED_CHANGES_V1_PREFIX = PATHS.scheduledChangesV1.base;

// Hook to get the current variant's paths based on URL pathname. Falls back to v1.
export function useVariantPaths(): VariantPaths {
    const location = useLocation();
    if (location.pathname.startsWith(PATHS.scheduledChangesV1.base)) {
        return PATHS.scheduledChangesV1;
    }
    if (location.pathname.startsWith(PATHS.onboardingV2.base)) {
        return PATHS.onboardingV2;
    }
    return PATHS.onboardingV1;
}
