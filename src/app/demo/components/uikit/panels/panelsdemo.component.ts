import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './panelsdemo.component.html'
})
export class PanelsDemoComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  companies = [
    {
      name: 'Company A',
      departments: [
        { name: 'Department 1', employees: this.generateEmployees('Department 1') },
        { name: 'Department 2', employees: this.generateEmployees('Department 2') },
        { name: 'Department 3', employees: this.generateEmployees('Department 3') },
        // Add more departments as needed
      ]
    },
    {
      name: 'Company B',
      departments: [
        { name: 'Department 1', employees: this.generateEmployees('Department 1') },
        { name: 'Department 2', employees: this.generateEmployees('Department 2') },
        { name: 'Department 3', employees: this.generateEmployees('Department 3') },
        // Add more departments as needed
      ]
    },
    // Add more companies as needed
  ];

  selectedEmployee: any;
  filteredEmployees: any[];

  generateEmployees(department: string) {
    const employees = [];
    for (let i = 1; i <= 100; i++) {
      employees.push({ name: `Employee ${i} (${department})`, department });
    }
    return employees;
  }

  filterEmployees(event) {
    const query = event.query.toLowerCase();
    this.filteredEmployees = [];

    this.companies.forEach(company => {
      company.departments.forEach(department => {
        const filtered = department.employees.filter(employee =>
          employee.name.toLowerCase().includes(query)
        );
        this.filteredEmployees.push(...filtered);
      });
    });
  }
}
