import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { AnnouncementTarget } from 'src/app/modules/announcement-target';
import { Company } from 'src/app/modules/company';

@Injectable({
  providedIn: 'root'
})
export class MaptotreeService {

  constructor() { }

  mapCompanyToTreeNode(company: Company): TreeNode<any> {
    return {
      label: company.name,
      data: {
        ...company,
        type: "COMPANY"
      },
      expanded: false,
      children: company.departments.map(department => ({
        label: department.name,
        data: {
          ...department,
          companyId: company.id,
          type: "DEPARTMENT"
        }
      }))
    } as TreeNode<any>;
  }

  mapTargetsToTreeNodes(targets: AnnouncementTarget[], companies: TreeNode<any>[]): TreeNode<any>[] {
    const selectedNodes: TreeNode<any>[] = [];

    if (!Array.isArray(targets) || !Array.isArray(companies)) {
      console.error("Invalid input data. Targets or Companies is not an array.");
      return selectedNodes;
    }

    targets.forEach(target => {
      companies.forEach(companyNode => {
        if (target.receiverType == "COMPANY" && target.sendTo == companyNode.data.id) {
          selectedNodes.push(companyNode);
          companyNode.children?.forEach(departmentNode => {
            selectedNodes.push(departmentNode);
          });
        }

        companyNode.children?.forEach(departmentNode => {
          if (target.receiverType == "DEPARTMENT" && target.sendTo == departmentNode.data.id) {
            selectedNodes.push(departmentNode);
          }
        });
      });
    });
    return selectedNodes;
  }

  mapCompaniesToNodesWithEmployees(company: any): TreeNode<any> {
    return {
        label: company.name,
        data: {
            ...company,
            type: "COMPANY"
        },
        expanded: false, // Hide children by default
        children: company.departments.map(department => ({
            label: department.name,
            data: {
                ...department,
                companyId: company.id, // Reference to the parent company
                type: "DEPARTMENT"
            },
            expanded: false, // Hide children by default
            children: department.employees.map(employee => ({
                label: employee.name,
                data: {
                    ...employee,
                    departmentId: department.id, // Reference to the parent department
                    type: "EMPLOYEE"
                }
            }))
        }))
    } as TreeNode<any>;
}



}
