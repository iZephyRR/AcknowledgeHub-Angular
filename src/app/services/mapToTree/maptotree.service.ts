import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { AnnouncementTarget } from 'src/app/modules/announcement-target';
import { Company } from 'src/app/modules/company';

@Injectable({
  providedIn: 'root'
})
export class MaptotreeService {

  constructor() { }

  mapAllCompaniesToTree(companies: Company[],checkAll: boolean = false): TreeNode<any> {
    return {
      label: "All Companies",
      data: {
        type: "ALL COMPANIES"
      }, // Single root node
      expanded: false, // Start expanded if you want the tree open by default
      children: companies.map(company => this.mapCompanyToTreeNode(company)) // Map each company
    } as TreeNode<any>;
  }

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
        },
      }))
    } as TreeNode<any>;
  }

  // expanded: false, // Default is collapsed
  //     children: department.employees.map(employee => ({
  //         label: employee.name,
  //         data: {
  //             ...employee,
  //             departmentId: department.id,
  //             type: "EMPLOYEE",
  //             department: department.name,
  //             company: company.name
  //         }
  //     }))

  mapTargetsToTreeNodes(targets: AnnouncementTarget[], companies: TreeNode<any>[]): TreeNode<any>[] {
    const selectedNodes: TreeNode<any>[] = [];
  
    if (!Array.isArray(targets) || !Array.isArray(companies)) {
      console.error("Invalid input data. Targets or Companies is not an array.");
      return selectedNodes;
    }
  
    const allCompaniesNode = companies.find(node => node.data.type === 'ALL COMPANIES');
  
    if (!allCompaniesNode) {
      console.error("Root node 'All Companies' not found.");
      return selectedNodes;
    }
  
    // Helper function to check if all children are selected
    const allChildrenSelected = (node: TreeNode<any>, selectedNodes: TreeNode<any>[]): boolean => {
      if (!node.children) return true;
      return node.children.every(child => selectedNodes.includes(child) || allChildrenSelected(child, selectedNodes));
    };
  
    // Iterate over the targets and map them to the tree nodes
    targets.forEach(target => {
      allCompaniesNode.children?.forEach(companyNode => {
        if (target.receiverType === "COMPANY" && target.sendTo === companyNode.data.id) {
          selectedNodes.push(companyNode); // Select company node
          companyNode.children?.forEach(departmentNode => {
            selectedNodes.push(departmentNode); // Optionally select all departments under the company
          });
        }
  
        companyNode.children?.forEach(departmentNode => {
          if (target.receiverType === "DEPARTMENT" && target.sendTo === departmentNode.data.id) {
            selectedNodes.push(departmentNode); // Select department node
          }
        });
      });
    });
  
    // Check if all child nodes of the root node are selected
    if (allChildrenSelected(allCompaniesNode, selectedNodes)) {
      selectedNodes.push(allCompaniesNode);
    }
  
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
          type: "DEPARTMENT",
          company: company.name
        },
        expanded: false, // Hide children by default
        children: department.employees.map(employee => ({
          label: employee.name,
          data: {
            ...employee,
            departmentId: department.id, // Reference to the parent department
            type: "EMPLOYEE",
            department: department.name,
            company: company.name,
            role: employee.role
          }
        }))
      }))
    } as TreeNode<any>;
  }



}
