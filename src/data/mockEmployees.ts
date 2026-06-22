export type EmployeeStatus = 'pending' | 'active' | 'resigned';

export type Employee = {
    id: string;
    employeeNumber: string;
    name: string;
    cpr: string;
    department: string;
    salary: number;
    hireDate: string;
    payPeriod: string;
    status: EmployeeStatus;
    totalPaidYtd?: number;
    lastPayment?: string;
    remainingVacationDays?: number;
    plannedChanges?: boolean;
    /** Date the employee record was created (Danish dd.mm.yyyy). */
    createdDate?: string;
    /**
     * When true, the AI extracted additional address/contact fields from
     * the source document. The edit page highlights these too and pre-fills
     * them with the values below.
     */
    enriched?: boolean;
    email?: string;
    phone?: string;
    address?: string;
    postCode?: string;
    city?: string;
};

export const mockEmployees: Employee[] = [
    {
        id: 'emp-1',
        employeeNumber: '5052',
        name: 'Anders Sørensen',
        cpr: '120385-1234',
        department: 'Administration',
        salary: 42500,
        hireDate: '01.03.2022',
        createdDate: '03.02.2022',
        payPeriod: 'Månedslønnede, forud',
        status: 'pending',
        enriched: true,
        email: 'anders.sorensen@cafevirksomhed.dk',
        phone: '+45 25 80 12 34',
        address: 'Strandvejen 42',
        postCode: '2900',
        city: 'Hellerup',
    },
    {
        id: 'emp-2',
        employeeNumber: '5002',
        name: 'Mette Jensen',
        cpr: '240791-5678',
        department: 'Salg',
        salary: 38000,
        hireDate: '15.08.2021',
        createdDate: '28.07.2021',
        payPeriod: 'Månedslønnede, bagud',
        status: 'pending',
        plannedChanges: true,
    },
    {
        id: 'emp-3',
        employeeNumber: '5016',
        name: 'Lars Nielsen',
        cpr: '030278-9012',
        department: 'Produktion',
        salary: 31200,
        hireDate: '12.06.2023',
        createdDate: '30.05.2023',
        payPeriod: '14-dages lønnede, udbetaling ulige uger',
        status: 'pending',
    },
    {
        id: 'emp-4',
        employeeNumber: '5004',
        name: 'Camilla Hansen',
        cpr: '180693-3456',
        department: 'Administration',
        salary: 45000,
        hireDate: '05.11.2019',
        createdDate: '21.10.2019',
        payPeriod: 'Månedslønnede, bagud',
        status: 'pending',
        plannedChanges: true,
    },
    {
        id: 'emp-5',
        employeeNumber: '5001',
        name: 'Mikkel Andersen',
        cpr: '110582-7890',
        department: 'Lager',
        salary: 29800,
        hireDate: '20.02.2020',
        createdDate: '04.02.2020',
        payPeriod: '14-dages lønnede, udbetaling lige uger',
        status: 'pending',
    },
];
