import { Component, OnInit } from '@angular/core';
import { NodeService } from 'src/app/demo/service/node.service';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-form-layout-demo',
  templateUrl: './formlayoutdemo.component.html',
})
export class FormLayoutDemoComponent implements OnInit {
  
  // Properties for form
  title: string = '';
  selectedCategory: any;
  categories = [
    { label: 'Category 1', value: 'cat1' },
    { label: 'Category 2', value: 'cat2' }
  ];
  target: string = '';
  scheduleOption: string = 'now';
  showDatePicker: boolean = false;
  scheduleDate: Date = new Date();
  selectedFile: File | null = null;
  filename?: string;
  filePreview?: string;
  fileType?: string;

  // Properties for tree
  files1: TreeNode[] = [];
  selectedFiles1: TreeNode[] = [];
  cols: any[] = [];

  constructor(private nodeService: NodeService) {}

  ngOnInit() {
    // Initialize tree data
    this.nodeService.getFiles().then(files => this.files1 = files);

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'type', header: 'Type' }
    ];
  }

  toggleDatePicker(show: boolean): void {
    this.showDatePicker = show;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      this.filename = file.name;
      this.fileType = file.type;

      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('pdf-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onSubmit(): void {
    // Handle form submission logic
    if (this.selectedFile) {
      // Process the selected file
      console.log('Form submitted with file:', this.selectedFile);
    }
  }

  isImage(): boolean {
    return this.fileType?.startsWith('image/') ||  false;
  }

  isVideo(): boolean {
    return this.fileType?.startsWith('video/') || false;
  }

  isAudio(): boolean {
    return this.fileType?.startsWith('audio/') || false;
  }

}
