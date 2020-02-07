import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource, MatNestedTreeNode } from '@angular/material/tree';
import { toPublicName } from '@angular/compiler/src/i18n/serializers/xmb';
import { AddDispositionDialogComponent } from '../../manage/disposition/add-disposition-dialog/add-disposition-dialog.component';
import { MatDialog } from '@angular/material';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/code-modules/api/api.service';
import { DynamicFieldConfigurationTypes } from 'src/app/code-modules/utils/data-driven-forms/ddf.enums';
import { BaseNode } from '../../../code-modules/api/api-objects.interfaces';
import { AppContextService } from 'src/app/code-modules/app-context/app-context.service';
import {DispositionTree} from '../../../code-modules/utils/disposition-tree/disposition-tree-config';

// interface BaseNode {
//   topic: string;
//   subTopics?: BaseNode[];
//   level?: string;
// }



@Component({
  selector: 'app-disposition',
  templateUrl: './disposition.component.html',
  styleUrls: ['./disposition.component.sass']
})
export class DispositionComponent implements OnInit {

  treeControl = new NestedTreeControl<BaseNode>(node => node.subTopics);
  dataSource = new MatTreeNestedDataSource<BaseNode>();
  dispositionNodes: BaseNode[]
  constructor(
    public addTopicDialog: MatDialog,
    private loader: NgxUiLoaderService,
    private toaster: ToastrService,
    private api: ApiService,
    public context: AppContextService,
    private dispositionTreeConfig:DispositionTree

  ) { }

  ngOnInit() {

    // this.dispositionNodes = this.setNodeLevel([]);
    this.loadDispositionData();
  }
  hasChild = (_: number, node: BaseNode) => !!node.subTopics && node.subTopics.length > 0;

  loadDispositionData() {
    this.loader.start();
    this.context.fetchDispositionDynamicFields().subscribe((disposition) => {
      if (disposition) {
        this.dispositionNodes = this.dispositionTreeConfig.setNodeLevel(disposition);
    
        this.setDispositionDataSource();
      }
      this.loader.stop();
    }, (err) => {
      this.loader.stop();
      this.toaster.error("Failed to fetch dispositions");
    })
  }

  setDispositionDataSource() {
    this.dataSource.data = null
    this.dataSource.data = this.dispositionNodes
  }
  addNewNode(node: BaseNode) {
    this.treeControl.expand(node);
    this.openAddNewTopicDialog(node.level);
  }

  
  removeNode(node: BaseNode) {
    this.dispositionNodes = this.dispositionTreeConfig.removeDispositionByNodeLevel(this.dispositionNodes, node.level)
    this.dispositionNodes = this.dispositionTreeConfig.distoyNodenevel(this.dispositionNodes);
    this.dispositionNodes = this.dispositionTreeConfig.setNodeLevel(this.dispositionNodes);
    this.setDispositionDataSource();
  }

  

  addNewTopic() {
    this.openAddNewTopicDialog();
  }

  openAddNewTopicDialog(level?: string) {
    const dialogRef = this.addTopicDialog.open(AddDispositionDialogComponent, {
      panelClass: 'co-dialog-panel',
    });
    dialogRef.afterClosed().subscribe(topic => {
      if (topic) {
        this.dispositionNodes = this.dispositionTreeConfig.addDispositionByNodeLevel(this.dispositionNodes, topic, level)
        this.setDispositionDataSource();
      }
    });

  }

  save() {
    this.loader.start();
    this.dispositionNodes = this.dispositionTreeConfig.distoyNodenevel(this.dispositionNodes);
    this.api.setDispositionTree(DynamicFieldConfigurationTypes.DISPOSITION, this.dispositionNodes).subscribe(() => {
      this.loader.stop();
      this.toaster.success("Success");
      this.loadDispositionData();
      //this.dispositionNodes = this.setNodeLevel(this.dispositionNodes);
    }, error1 => {
      this.loader.stop();
      this.toaster.error('Something went wrong');
    });
  }
  getBgColor(node: BaseNode) {
    if (node.level) {
      const level = node.level.split(":");
      if (level.length === 1) {
        const index = parseInt(level[0])
        if (index % 2 === 0)
          return "#8c8c8c1a"
        else
          return "#8c8c8c26"
      }
      else
        return "none"
    }
  }
}
