import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Header, Navigation2 } from '@economic/taco';
import type { Agreement } from '@economic/taco';
import { da } from '../data/danishCopy';
import { PATHS, useVariantPaths } from '../paths';
import { clearEmployees } from '../store/employeesStore';

const appAgreement: Agreement = {
    number: 1234567,
    name: 'Café Virksomhed',
    userId: 'demo-user',
};

const isEmbedded =
    typeof window !== 'undefined' && window.self !== window.top;

export function AppShell() {
    const navigate = useNavigate();
    const location = useLocation();
    const variantPaths = useVariantPaths();

    const navTo = (path: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(path);
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <Layout>
            <Layout.Top>
                {() => (
                    <div className="relative z-30">
                        <Header>
                            <Header.Logo
                                href={PATHS.landing}
                                onClick={navTo(PATHS.landing)}
                            />

                            <Header.PrimaryNavigation>
                                <Header.Link href="#">{da.nav.top.home}</Header.Link>
                                <Header.Link href="#">{da.nav.top.sales}</Header.Link>
                                <Header.Link href="#">{da.nav.top.accounting}</Header.Link>
                                <Header.Link href="#">{da.nav.top.reports}</Header.Link>
                                <Header.Link
                                    href={variantPaths.employees}
                                    aria-current="page"
                                    onClick={navTo(variantPaths.employees)}
                                >
                                    {da.nav.top.payroll}
                                </Header.Link>
                            </Header.PrimaryNavigation>

                            <Header.SecondaryNavigation>
                                <Header.Button icon="search-bold" aria-label="Søg" />
                                <Header.Button icon="inbox" aria-label="Indbakke" />
                                <Header.Button icon="market" aria-label="Marked" />
                                <Header.Button icon="bell-solid" aria-label="Notifikationer" />
                                <Header.Button icon="chat-solid" aria-label="Chat" />
                                <Header.Button icon="e-copedia" aria-label="e-copedia" />
                                <Header.Button icon="settings-solid" aria-label={da.nav.settings} />
                            </Header.SecondaryNavigation>

                            <Header.AgreementDisplay
                                currentAgreement={appAgreement}
                                fallbackImageSrc=""
                            />
                        </Header>
                    </div>
                )}
            </Layout.Top>

            <Layout.Page>
                <Layout.Sidebar>
                    {() => (
                        <Navigation2>
                            <Navigation2.Group
                                heading={da.nav.payroll}
                                defaultExpanded
                            >
                                <Navigation2.Link
                                    href={variantPaths.payrollOverview}
                                    active={isActive(variantPaths.payrollOverview)}
                                    onClick={navTo(variantPaths.payrollOverview)}
                                >
                                    {da.nav.payrollOverview}
                                </Navigation2.Link>
                                <Navigation2.Link
                                    href={variantPaths.payrollRuns}
                                    active={isActive(variantPaths.payrollRuns)}
                                    onClick={navTo(variantPaths.payrollRuns)}
                                >
                                    {da.nav.payrollRuns}
                                </Navigation2.Link>
                                <Navigation2.Link
                                    href={variantPaths.payrollArchive}
                                    active={isActive(variantPaths.payrollArchive)}
                                    onClick={navTo(variantPaths.payrollArchive)}
                                >
                                    {da.nav.payrollArchive}
                                </Navigation2.Link>
                            </Navigation2.Group>

                            <Navigation2.Group
                                heading={da.nav.employee}
                                defaultExpanded
                            >
                                <Navigation2.Link
                                    href={variantPaths.employees}
                                    active={isActive(variantPaths.employees)}
                                    onClick={navTo(variantPaths.employees)}
                                >
                                    {da.nav.allEmployees}
                                </Navigation2.Link>
                                <Navigation2.Link
                                    href={variantPaths.employeeReview}
                                    active={isActive(variantPaths.employeeReview)}
                                    onClick={navTo(variantPaths.employeeReview)}
                                >
                                    {da.nav.employeeReview}
                                </Navigation2.Link>
                                <Navigation2.Link
                                    href={variantPaths.employeeGroups}
                                    active={isActive(variantPaths.employeeGroups)}
                                    onClick={navTo(variantPaths.employeeGroups)}
                                >
                                    {da.nav.employeeGroups}
                                </Navigation2.Link>
                            </Navigation2.Group>

                            <Navigation2.Group
                                heading={da.nav.reports}
                                defaultExpanded={location.pathname.startsWith(
                                    variantPaths.base + '/reports'
                                )}
                            >
                                <Navigation2.Link
                                    href={variantPaths.reportsVacation}
                                    active={isActive(variantPaths.reportsVacation)}
                                    onClick={navTo(variantPaths.reportsVacation)}
                                >
                                    {da.nav.vacationAllowance}
                                </Navigation2.Link>
                            </Navigation2.Group>

                            <Navigation2.Group
                                heading={da.nav.settings}
                                defaultExpanded={location.pathname.startsWith(
                                    variantPaths.base + '/settings'
                                )}
                            >
                                <Navigation2.Link
                                    href={variantPaths.settingsCompany}
                                    active={isActive(variantPaths.settingsCompany)}
                                    onClick={navTo(variantPaths.settingsCompany)}
                                >
                                    {da.nav.company}
                                </Navigation2.Link>
                            </Navigation2.Group>

                            <Navigation2.Content>
                                <div className="flex flex-col gap-2 items-start">
                                    {!isEmbedded && (
                                        <a
                                            href={PATHS.landing}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(PATHS.landing);
                                            }}
                                            className="text-xs text-neutral-500 hover:text-neutral-900 underline px-2 py-1"
                                        >
                                            {da.landing.backToLanding}
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            clearEmployees();
                                            window.location.assign(
                                                variantPaths.employees
                                            );
                                        }}
                                        className="text-xs text-neutral-500 hover:text-neutral-900 underline px-2 py-1"
                                    >
                                        {da.actions.reset}
                                    </button>
                                </div>
                            </Navigation2.Content>
                        </Navigation2>
                    )}
                </Layout.Sidebar>

                <Layout.Content>
                    <div className="px-6 py-6 w-full flex flex-col">
                        <Outlet />
                    </div>
                </Layout.Content>
            </Layout.Page>
        </Layout>
    );
}
