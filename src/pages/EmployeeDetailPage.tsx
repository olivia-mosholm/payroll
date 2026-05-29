import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Tabs,
    Badge,
    Button,
    Alert,
    Banner,
    Icon,
    Menu,
    type Color,
} from '@economic/taco';
import { useEmployees } from '../store/employeesStore';
import type { Employee, EmployeeStatus } from '../data/mockEmployees';
import { da } from '../data/danishCopy';
import { useVariantPaths } from '../paths';
import { EmployeeEditDialogV2 } from '../features/employee-onboarding/EmployeeEditDialogV2';

const STATUS_COLOR: Record<EmployeeStatus, Color> = {
    pending: 'orange',
    active: 'green',
    resigned: 'grey',
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
    pending: da.status.pending,
    active: da.status.active,
    resigned: da.status.resigned,
};

// --- Stat cards ----------------------------------------------------------

function StatCard({
    title,
    value,
    subtitle,
}: {
    title: string;
    value: string;
    subtitle?: string;
}) {
    return (
        <div className="flex-1 min-w-0 rounded-lg border border-grey-300 bg-white px-4 py-3">
            <p className="text-xs font-bold text-neutral-900 mb-1.5 mt-0">
                {title}
            </p>
            <p className="text-2xl font-normal text-neutral-900 leading-tight truncate mb-0 mt-0">
                {value}
            </p>
            {subtitle && (
                <p className="text-xs text-neutral-500 mt-1 mb-0">{subtitle}</p>
            )}
        </div>
    );
}

function GrossYtdCard() {
    const s = da.detailPage.stats;
    return (
        <div className="flex-1 min-w-0 rounded-lg border-2 border-blue-500 bg-white px-4 py-3">
            <p className="text-xs font-bold text-neutral-900 mb-1.5 mt-0">
                {s.grossYtd}
            </p>
            <p className="text-2xl font-normal text-blue-500 leading-tight truncate mb-0 mt-0">
                0,00 {s.grossYtdCurrency}
            </p>
            <p className="text-xs text-neutral-500 mt-1 mb-0">
                {s.grossYtdTotal}
            </p>
        </div>
    );
}

// --- Read-only field display --------------------------------------------

function ReadOnlyField({
    label,
    value,
    required,
    highlight,
}: {
    label: string;
    value: string | undefined;
    required?: boolean;
    highlight?: boolean;
}) {
    const display = value && value.length > 0 ? value : 'n/a';
    const isMissing = !value;
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <dt className="text-xs font-bold text-neutral-900">
                {label}
                {required && '*'}
            </dt>
            <dd
                className={`text-sm leading-5 truncate ${
                    highlight
                        ? 'inline-flex self-start bg-yellow-100 rounded px-2 py-0.5 -mx-2 text-neutral-900 font-medium max-w-full'
                        : isMissing
                          ? 'text-neutral-500'
                          : 'text-neutral-900'
                }`}
                title={display}
            >
                {display}
            </dd>
        </div>
    );
}

// --- Section card --------------------------------------------------------

function SectionCard({
    id,
    title,
    onEdit,
    children,
    footer,
}: {
    id: string;
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-24 rounded-lg border border-grey-300 bg-white"
        >
            <header className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">
                    {title}
                </h2>
                <Button appearance="default" onClick={onEdit}>
                    {da.detailPage.edit}
                </Button>
            </header>
            <div className="px-6 pb-6 flex flex-col gap-4">
                <dl className="grid grid-cols-3 gap-x-8 gap-y-5">
                    {children}
                </dl>
                {footer}
            </div>
        </section>
    );
}

// --- Section content ----------------------------------------------------

function PersonalInfoSection({
    employee,
    onEdit,
}: {
    employee: Employee;
    onEdit: () => void;
}) {
    const f = da.editDialog.fields;
    const enriched = employee.enriched ?? false;
    return (
        <SectionCard
            id="personoplysninger"
            title={da.detailPage.sections.personalInfo}
            onEdit={onEdit}
        >
            {/* Column 1 */}
            <ReadOnlyField label={f.cpr} value={employee.cpr} required />
            <ReadOnlyField
                label={da.editDialog.fields.country}
                value={da.editDialog.defaults.country}
                required
            />
            <ReadOnlyField
                label={f.employeeGroup}
                value={da.editDialog.defaults.employeeGroup}
            />

            <ReadOnlyField label={f.fullName} value={employee.name} required />
            <ReadOnlyField
                label={da.detailPage.fieldLabels.tin}
                value={undefined}
            />
            <div className="grid grid-cols-2 gap-4">
                <ReadOnlyField
                    label={f.employmentDate}
                    value={employee.hireDate}
                    required
                    highlight={enriched}
                />
                <ReadOnlyField
                    label={f.employeeNumber}
                    value={employee.employeeNumber}
                    required
                    highlight={enriched}
                />
            </div>

            <ReadOnlyField label={f.co} value={undefined} />
            <ReadOnlyField
                label={f.email}
                value={employee.email}
                highlight={enriched && !!employee.email}
            />
            <div />

            <div className="grid grid-cols-[110px_1fr] gap-3">
                <ReadOnlyField
                    label={f.postCode}
                    value={employee.postCode}
                    required
                    highlight={enriched && !!employee.postCode}
                />
                <ReadOnlyField
                    label={f.city}
                    value={employee.city}
                    required
                    highlight={enriched && !!employee.city}
                />
            </div>
            <ReadOnlyField
                label={f.phone}
                value={employee.phone}
                highlight={enriched && !!employee.phone}
            />
            <div />

            <ReadOnlyField
                label={f.address}
                value={employee.address}
                required
                highlight={enriched && !!employee.address}
            />
        </SectionCard>
    );
}

function PaymentSection({
    employee,
    onEdit,
}: {
    employee: Employee;
    onEdit: () => void;
}) {
    const t = da.detailPage.payment;
    return (
        <section
            id="lonudbetaling"
            className="scroll-mt-24 rounded-lg border border-grey-300 bg-white"
        >
            <header className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">
                    {da.detailPage.sections.payment}
                </h2>
                <Button appearance="default" onClick={onEdit}>
                    {da.detailPage.edit}
                </Button>
            </header>
            <div className="px-6 pb-6">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <ReadOnlyField label={t.bankReg} value={undefined} />
                    <ReadOnlyField label={t.bankAccount} value={undefined} />
                    <ReadOnlyField
                        label={t.payoutMethod}
                        value={t.payoutMethodValue}
                    />
                    <ReadOnlyField
                        label={t.payFrequency}
                        value={employee.payPeriod || t.payFrequencyValue}
                    />
                    <ReadOnlyField label={t.iban} value={undefined} />
                    <ReadOnlyField label={t.bicSwift} value={undefined} />
                </dl>
            </div>
        </section>
    );
}

function TaxCardSection({ onEdit }: { onEdit: () => void }) {
    const t = da.detailPage.taxCard;
    return (
        <section
            id="skattekort"
            className="scroll-mt-24 rounded-lg border border-grey-300 bg-white"
        >
            <header className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">
                    {da.detailPage.sections.taxCard}
                </h2>
                <Button appearance="default" onClick={onEdit}>
                    {da.detailPage.edit}
                </Button>
            </header>
            <div className="px-6 pb-6 flex flex-col gap-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <ReadOnlyField label={t.cardType} value={undefined} />
                    <ReadOnlyField label={t.aTaxPercent} value={undefined} />
                    <ReadOnlyField label={t.amContributionPercent} value="8 %" />
                    <ReadOnlyField label={t.taxFreeAllowance} value={undefined} />
                    <ReadOnlyField label={t.taxDebt} value={undefined} />
                </dl>
                <Banner state="warning">
                    <div className="flex flex-col gap-1">
                        <strong>{t.missingTitle}</strong>
                        <p className="mb-0">{t.missingBody}</p>
                    </div>
                </Banner>
            </div>
        </section>
    );
}

function HolidaySection({
    onEdit,
}: {
    onEdit: () => void;
}) {
    const t = da.detailPage.holiday;
    return (
        <section
            id="ferie"
            className="scroll-mt-24 rounded-lg border border-grey-300 bg-white"
        >
            <header className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">
                    {da.detailPage.sections.holiday}
                </h2>
                <Button appearance="default" onClick={onEdit}>
                    {da.detailPage.edit}
                </Button>
            </header>
            <div className="px-6 pb-6">
                <dl className="grid grid-cols-3 gap-x-8 gap-y-5">
                    <ReadOnlyField label={t.scheme} value={t.schemeValue} />
                    <ReadOnlyField label={t.statutory} value="25 dage" />
                    <ReadOnlyField label={t.extra} value="5 dage" />
                    <ReadOnlyField label={t.transferred} value={undefined} />
                    <ReadOnlyField label={t.vacationFund} value="FerieKonto" />
                </dl>
            </div>
        </section>
    );
}

// --- Anchor navigation --------------------------------------------------

type SectionMeta = { id: string; label: string };

function AnchorNav({
    sections,
    activeId,
    onJump,
}: {
    sections: SectionMeta[];
    activeId: string;
    onJump: (id: string) => void;
}) {
    return (
        <nav
            aria-label="Sektionsnavigation"
            className="sticky top-6 flex flex-col gap-px"
        >
            {sections.map((s) => {
                const active = s.id === activeId;
                return (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onJump(s.id);
                        }}
                        className={`pl-3 py-1.5 text-sm border-l-2 transition-colors ${
                            active
                                ? 'border-blue-500 text-blue-500 font-bold'
                                : 'border-grey-300 text-neutral-700 hover:text-neutral-900'
                        }`}
                    >
                        {s.label}
                    </a>
                );
            })}
        </nav>
    );
}

// --- Existing legacy tab content (preserved) ----------------------------

function YearToggle() {
    return (
        <div className="inline-flex items-center gap-1 bg-neutral-100 rounded p-0.5">
            <button
                type="button"
                className="text-sm px-3 py-1 rounded bg-white border border-neutral-300 font-bold"
            >
                {da.detailPage.currentYear}
            </button>
            <button
                type="button"
                className="text-sm px-3 py-1 rounded text-neutral-700 hover:bg-white"
            >
                {da.detailPage.previousYear}
            </button>
        </div>
    );
}

function BalancesTab() {
    const t = da.detailPage.balances;
    const rows: Array<{ no?: string; item: string; amount: string }> = [
        { item: t.rows.gross, amount: '0,00 DKK' },
        { no: '13', item: t.rows.amYes, amount: '0,00' },
        { no: '14', item: t.rows.amNo, amount: '0,00' },
        { no: '15', item: t.rows.aTax, amount: '0,00' },
        { no: '16', item: t.rows.amContribution, amount: '0,00' },
        { no: '19', item: t.rows.freeCar, amount: '0,00' },
        { no: '20', item: t.rows.multimedia, amount: '0,00' },
        { no: '21', item: t.rows.freeFoodLodging, amount: '0,00' },
    ];
    return (
        <div className="flex flex-col gap-4 pt-4">
            <YearToggle />
            <div className="rounded-lg border border-grey-300 bg-white">
                <header className="px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {t.sectionTitle}
                    </h2>
                </header>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-700 border-b border-grey-300">
                            <th className="font-bold px-6 py-3 w-20">{t.colNo}</th>
                            <th className="font-bold px-6 py-3">{t.colItem}</th>
                            <th className="font-bold px-6 py-3 text-right">
                                {t.colAmount}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                className="border-b border-grey-200 last:border-b-0"
                            >
                                <td className="px-6 py-3 text-neutral-700">
                                    {row.no ?? ''}
                                </td>
                                <td className="px-6 py-3 text-neutral-900">
                                    {row.item}
                                </td>
                                <td className="px-6 py-3 text-right text-neutral-900">
                                    {row.amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function VacationSavingsTab() {
    const v = da.detailPage.vacation;
    const days = [
        {
            type: v.statutory,
            period: '01.09.25 - 31.08.26',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
        {
            type: v.statutory,
            period: '01.09.24 - 31.08.25',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
        {
            type: v.transferred,
            period: '',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
    ];
    return (
        <div className="flex flex-col gap-6 pt-4">
            <div className="rounded-lg border border-grey-300 bg-white">
                <header className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {v.sectionTitle}
                    </h2>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
                    >
                        <Icon name="edit" />
                        {da.detailPage.edit}
                    </button>
                </header>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-700 border-b border-grey-300">
                            <th className="font-bold px-6 py-3 w-32">{v.colType}</th>
                            <th className="font-bold px-6 py-3">
                                {v.colAccrualPeriod}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {v.colEarned}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {v.colTaken}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {v.colRemaining}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((d, i) => (
                            <tr
                                key={i}
                                className="border-b border-grey-200"
                            >
                                <td className="px-6 py-3 text-neutral-900">
                                    {d.type}
                                </td>
                                <td className="px-6 py-3 text-neutral-700">
                                    {d.period}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    {d.earned}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    {d.taken}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    {d.rest}
                                </td>
                            </tr>
                        ))}
                        <tr className="font-bold">
                            <td className="px-6 py-3">{v.total}</td>
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="rounded-lg border border-grey-300 bg-white">
                <header className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {v.taxSectionTitle}
                    </h2>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
                    >
                        <Icon name="edit" />
                        {da.detailPage.edit}
                    </button>
                </header>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-700 border-b border-grey-300">
                            <th className="font-bold px-6 py-3">{v.taxColType}</th>
                            <th className="font-bold px-6 py-3 text-right w-48">
                                <div>{da.detailPage.currentYear}</div>
                                <div className="text-xs font-normal text-neutral-500">
                                    01.09.25-31.08.26
                                </div>
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-48">
                                <div>{da.detailPage.previousYear}</div>
                                <div className="text-xs font-normal text-neutral-500">
                                    01.09.24-31.08.25
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-6 py-3">{v.taxBasis}</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00 DKK</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PayHistoryTab() {
    return (
        <div className="py-16 text-sm text-neutral-500 text-center">
            {da.editDialog.tabPlaceholder}
        </div>
    );
}

// --- Overview tab (the new stacked-cards layout) ------------------------

const SECTIONS: SectionMeta[] = [
    { id: 'personoplysninger', label: da.detailPage.sections.personalInfo },
    { id: 'lonudbetaling', label: da.detailPage.sections.payment },
    { id: 'skattekort', label: da.detailPage.sections.taxCard },
    { id: 'ferie', label: da.detailPage.sections.holiday },
];

function OverviewTab({
    employee,
    onEdit,
}: {
    employee: Employee;
    onEdit: () => void;
}) {
    const [activeId, setActiveId] = useState(SECTIONS[0].id);

    useEffect(() => {
        const ids = SECTIONS.map((s) => s.id);
        const observer = new IntersectionObserver(
            (entries) => {
                // Pick the section whose top is closest to the viewport top.
                const visible = entries.filter((e) => e.isIntersecting);
                if (visible.length === 0) return;
                visible.sort(
                    (a, b) =>
                        a.boundingClientRect.top - b.boundingClientRect.top,
                );
                const top = visible[0];
                if (top) setActiveId(top.target.id);
            },
            // Anchor activates when the section's top is within the middle
            // 40% of the viewport so the highlight moves smoothly as the
            // user scrolls.
            { rootMargin: '-20% 0px -50% 0px', threshold: 0 },
        );
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        }
        return () => observer.disconnect();
    }, []);

    const handleJump = (id: string) => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveId(id);
    };

    return (
        <div className="flex gap-8 pt-6 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-6">
                <PersonalInfoSection employee={employee} onEdit={onEdit} />
                <div className="grid grid-cols-2 gap-6">
                    <PaymentSection employee={employee} onEdit={onEdit} />
                    <TaxCardSection onEdit={onEdit} />
                </div>
                <HolidaySection onEdit={onEdit} />
            </div>
            <aside className="w-44 shrink-0">
                <AnchorNav
                    sections={SECTIONS}
                    activeId={activeId}
                    onJump={handleJump}
                />
            </aside>
        </div>
    );
}

// --- Page ----------------------------------------------------------------

export function EmployeeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const variantPaths = useVariantPaths();
    const employees = useEmployees();
    const employee = employees.find((e) => e.id === id);
    const backToList = `${variantPaths.employees}?state=processed`;
    const [editing, setEditing] = useState(false);

    const stats = useMemo(() => {
        if (!employee) return null;
        return da.detailPage.stats;
    }, [employee]);

    if (!employee || !stats) {
        return (
            <div className="flex flex-col gap-4">
                <button
                    type="button"
                    onClick={() => navigate(backToList)}
                    className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline self-start"
                >
                    <Icon name="chevron-left" />
                    {da.detailPage.back}
                </button>
                <Alert state="warning" title="Medarbejder ikke fundet">
                    Gå tilbage til listen og åbn en medarbejder igen.
                </Alert>
            </div>
        );
    }

    const tabs = da.detailPage.overviewTabs;

    return (
        <div className="flex flex-col gap-6">
            <button
                type="button"
                onClick={() => navigate(backToList)}
                className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline self-start"
            >
                <Icon name="chevron-left" />
                {da.detailPage.back}
            </button>

            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-normal leading-9 text-neutral-900">
                    {employee.name}
                </h1>
                <Badge color={STATUS_COLOR[employee.status]} subtle>
                    {STATUS_LABEL[employee.status]}
                </Badge>
                <Button
                    appearance="default"
                    menu={(props) => (
                        <Menu {...props}>
                            <Menu.Content>
                                <Menu.Item
                                    onClick={() => setEditing(true)}
                                >
                                    {da.detailPage.edit}
                                </Menu.Item>
                                <Menu.Item disabled>
                                    {da.actions.morePlaceholder}
                                </Menu.Item>
                            </Menu.Content>
                        </Menu>
                    )}
                >
                    {da.detailPage.actions}
                </Button>
            </div>

            <div className="flex items-stretch gap-3">
                <StatCard title={stats.hours} value={`0,00 ${stats.hoursUnit}`} />
                <StatCard
                    title={stats.remainingVacation}
                    value={`0,00 ${stats.remainingVacationUnit}`}
                    subtitle={stats.payDuringVacation}
                />
                <StatCard title={stats.payPeriod} value={stats.payPeriodValue} />
                <StatCard
                    title={stats.nextPayment}
                    value={stats.nextPaymentValue}
                    subtitle={stats.nextPaymentSubtitle}
                />
                <GrossYtdCard />
            </div>

            <Tabs defaultId="overview">
                <Tabs.List>
                    <Tabs.Trigger id="overview">{tabs.overview}</Tabs.Trigger>
                    <Tabs.Trigger id="balances">{tabs.balances}</Tabs.Trigger>
                    <Tabs.Trigger id="holiday-savings">
                        {tabs.holidaySavings}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="pay-history">
                        {tabs.payHistory}
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content id="overview">
                    <OverviewTab
                        employee={employee}
                        onEdit={() => setEditing(true)}
                    />
                </Tabs.Content>
                <Tabs.Content id="balances">
                    <BalancesTab />
                </Tabs.Content>
                <Tabs.Content id="holiday-savings">
                    <VacationSavingsTab />
                </Tabs.Content>
                <Tabs.Content id="pay-history">
                    <PayHistoryTab />
                </Tabs.Content>
            </Tabs>

            <EmployeeEditDialogV2
                employee={editing ? employee : null}
                onClose={() => setEditing(false)}
            />
        </div>
    );
}
