import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Badge, Button, Alert, Field, Input, Icon, type Color } from '@economic/taco';
import { useEmployees } from '../store/employeesStore';
import type { Employee, EmployeeStatus } from '../data/mockEmployees';
import { da } from '../data/danishCopy';
import { useVariantPaths } from '../paths';

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

const HIGHLIGHT = 'bg-yellow-100';

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
        <div className="flex-1 min-w-0 rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <p className="text-xs font-bold text-neutral-900 mb-1.5 mt-0">{title}</p>
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
            <p className="text-xs font-bold text-neutral-900 mb-1.5 mt-0">{s.grossYtd}</p>
            <p className="text-2xl font-normal text-blue-500 leading-tight truncate mb-0 mt-0">
                0,00 {s.grossYtdCurrency}
            </p>
            <p className="text-xs text-neutral-500 mt-1 mb-0">{s.grossYtdTotal}</p>
        </div>
    );
}

function HighlightedInput({
    highlighted,
    defaultValue,
}: {
    highlighted: boolean;
    defaultValue?: string;
}) {
    return (
        <Input
            defaultValue={defaultValue ?? ''}
            className={highlighted ? HIGHLIGHT : undefined}
        />
    );
}

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
            <div className="rounded-lg border border-neutral-200 bg-white">
                <header className="px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {t.sectionTitle}
                    </h2>
                </header>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-700 border-b border-neutral-200">
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
                                className="border-b border-neutral-100 last:border-b-0"
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

function VacationTab() {
    const t = da.detailPage.vacation;
    const days = [
        {
            type: t.statutory,
            period: '01.09.25 - 31.08.26',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
        {
            type: t.statutory,
            period: '01.09.24 - 31.08.25',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
        {
            type: t.transferred,
            period: '',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
    ];
    return (
        <div className="flex flex-col gap-6 pt-4">
            <div className="rounded-lg border border-neutral-200 bg-white">
                <header className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {t.sectionTitle}
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
                        <tr className="text-left text-neutral-700 border-b border-neutral-200">
                            <th className="font-bold px-6 py-3 w-32">{t.colType}</th>
                            <th className="font-bold px-6 py-3">
                                {t.colAccrualPeriod}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {t.colEarned}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {t.colTaken}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {t.colRemaining}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((d, i) => (
                            <tr
                                key={i}
                                className="border-b border-neutral-100"
                            >
                                <td className="px-6 py-3 text-neutral-900">{d.type}</td>
                                <td className="px-6 py-3 text-neutral-700">
                                    {d.period}
                                </td>
                                <td className="px-6 py-3 text-right">{d.earned}</td>
                                <td className="px-6 py-3 text-right">{d.taken}</td>
                                <td className="px-6 py-3 text-right">{d.rest}</td>
                            </tr>
                        ))}
                        <tr className="font-bold">
                            <td className="px-6 py-3">{t.total}</td>
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SavingsTab() {
    const t = da.detailPage.vacation;
    return (
        <div className="flex flex-col gap-6 pt-4">
            <div className="rounded-lg border border-neutral-200 bg-white">
                <header className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {t.taxSectionTitle}
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
                        <tr className="text-left text-neutral-700 border-b border-neutral-200">
                            <th className="font-bold px-6 py-3">{t.taxColType}</th>
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
                            <td className="px-6 py-3">{t.taxBasis}</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00 DKK</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function GeneralTab({ employee }: { employee: Employee }) {
    const t = da.editDialog;
    const f = t.fields;
    const isEnriched = employee.enriched ?? false;
    const extracted = {
        cpr: true,
        fullName: true,
        country: false,
        employeeGroup: false,
        employmentDate: true,
        employeeNumber: true,
        department: true,
        payPeriod: true,
        // Address & contact are only extracted on enriched drafts (the
        // prototype always includes one enriched draft per import batch).
        postCode: isEnriched,
        city: isEnriched,
        address: isEnriched,
        email: isEnriched,
        phone: isEnriched,
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            <Alert state="information" title={t.alertTitle}>
                {t.alertBody}
            </Alert>

            <h3 className="text-sm font-bold text-neutral-900 mt-2">
                {t.sectionGeneral}
            </h3>

            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <div className="flex flex-col gap-4">
                    <Field>
                        <span className="text-xs font-bold">{f.cpr}*</span>
                        <div className="flex gap-2 items-start">
                            <HighlightedInput
                                highlighted={extracted.cpr}
                                defaultValue={employee.cpr}
                            />
                            <Button appearance="default">{f.fetchCpr}</Button>
                        </div>
                    </Field>
                    <Field>
                        <span className="text-xs font-bold">{f.fullName}*</span>
                        <HighlightedInput
                            highlighted={extracted.fullName}
                            defaultValue={employee.name}
                        />
                    </Field>
                    <Field>
                        <span className="text-xs font-bold">{f.co}</span>
                        <HighlightedInput highlighted={false} />
                    </Field>
                    <div className="grid grid-cols-[110px_1fr] gap-2">
                        <Field>
                            <span className="text-xs font-bold">{f.postCode}*</span>
                            <HighlightedInput
                                highlighted={extracted.postCode}
                                defaultValue={employee.postCode}
                            />
                        </Field>
                        <Field>
                            <span className="text-xs font-bold">{f.city}*</span>
                            <HighlightedInput
                                highlighted={extracted.city}
                                defaultValue={employee.city}
                            />
                        </Field>
                    </div>
                    <Field>
                        <span className="text-xs font-bold">{f.address}*</span>
                        <HighlightedInput
                            highlighted={extracted.address}
                            defaultValue={employee.address}
                        />
                    </Field>
                </div>

                <div className="flex flex-col gap-4">
                    <Field>
                        <span className="text-xs font-bold">{f.country}*</span>
                        <HighlightedInput
                            highlighted={extracted.country}
                            defaultValue={t.defaults.country}
                        />
                    </Field>
                    <Field>
                        <span className="text-xs font-bold">{f.email}</span>
                        <HighlightedInput
                            highlighted={extracted.email}
                            defaultValue={employee.email}
                        />
                    </Field>
                    <Field>
                        <span className="text-xs font-bold">{f.phone}</span>
                        <HighlightedInput
                            highlighted={extracted.phone}
                            defaultValue={employee.phone}
                        />
                    </Field>
                </div>

                <div className="flex flex-col gap-4">
                    <Field>
                        <span className="text-xs font-bold">{f.employeeGroup}</span>
                        <HighlightedInput
                            highlighted={extracted.employeeGroup}
                            defaultValue={t.defaults.employeeGroup}
                        />
                    </Field>
                    <div className="grid grid-cols-[1fr_1fr] gap-2">
                        <Field>
                            <span className="text-xs font-bold">{f.employmentDate}*</span>
                            <HighlightedInput
                                highlighted={extracted.employmentDate}
                                defaultValue={employee.hireDate}
                            />
                        </Field>
                        <Field>
                            <span className="text-xs font-bold">{f.employeeNumber}*</span>
                            <HighlightedInput
                                highlighted={extracted.employeeNumber}
                                defaultValue={employee.employeeNumber}
                            />
                        </Field>
                    </div>
                    <Field>
                        <span className="text-xs font-bold">{f.department}</span>
                        <HighlightedInput
                            highlighted={extracted.department}
                            defaultValue={employee.department}
                        />
                    </Field>
                    <Field>
                        <span className="text-xs font-bold">{f.payPeriod}</span>
                        <HighlightedInput
                            highlighted={extracted.payPeriod}
                            defaultValue={employee.payPeriod}
                        />
                    </Field>
                </div>
            </div>
        </div>
    );
}

function PlaceholderTab() {
    return (
        <div className="py-12 text-sm text-neutral-500 text-center">
            {da.editDialog.tabPlaceholder}
        </div>
    );
}

export function EmployeeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const variantPaths = useVariantPaths();
    const employees = useEmployees();
    const employee = employees.find((e) => e.id === id);
    const backToList = `${variantPaths.employees}?state=processed`;

    if (!employee) {
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

    const s = da.detailPage.stats;

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
                <Button appearance="default">
                    {da.detailPage.more}
                    <Icon name="chevron-down" />
                </Button>
            </div>

            <div className="flex items-stretch gap-3">
                <StatCard title={s.hours} value={`0,00 ${s.hoursUnit}`} />
                <StatCard
                    title={s.remainingVacation}
                    value={`0,00 ${s.remainingVacationUnit}`}
                    subtitle={s.payDuringVacation}
                />
                <StatCard title={s.payPeriod} value={s.payPeriodValue} />
                <StatCard
                    title={s.nextPayment}
                    value={s.nextPaymentValue}
                    subtitle={s.nextPaymentSubtitle}
                />
                <GrossYtdCard />
            </div>

            <Tabs defaultId="personal-info">
                <Tabs.List>
                    <Tabs.Trigger id="personal-info">
                        {da.detailPage.tabs.personalInfo}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="employment">
                        {da.detailPage.tabs.employment}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="vacation">
                        {da.detailPage.tabs.vacation}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="salary">
                        {da.detailPage.tabs.salary}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="pension">
                        {da.detailPage.tabs.pension}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="options">
                        {da.detailPage.tabs.options}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="statistics">
                        {da.detailPage.tabs.statistics}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="registration">
                        {da.detailPage.tabs.registration}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="balances">
                        {da.detailPage.tabs.balances}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="savings">
                        {da.detailPage.tabs.savings}
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content id="personal-info"><GeneralTab employee={employee} /></Tabs.Content>
                <Tabs.Content id="employment"><PlaceholderTab /></Tabs.Content>
                <Tabs.Content id="vacation"><PlaceholderTab /></Tabs.Content>
                <Tabs.Content id="salary"><PlaceholderTab /></Tabs.Content>
                <Tabs.Content id="pension"><PlaceholderTab /></Tabs.Content>
                <Tabs.Content id="options"><PlaceholderTab /></Tabs.Content>
                <Tabs.Content id="statistics"><PlaceholderTab /></Tabs.Content>
                <Tabs.Content id="registration"><PlaceholderTab /></Tabs.Content>
                <Tabs.Content id="balances"><BalancesTab /></Tabs.Content>
                <Tabs.Content id="savings">
                    <VacationTab />
                    <SavingsTab />
                </Tabs.Content>
            </Tabs>
        </div>
    );
}
