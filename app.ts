/// <reference path="./typings/angular2/angular2.d.ts" />
declare var OnsTabElement: {prototype: {_createPageElement: Function}};
declare var ons: any;

import {
  Component,
  View,
  bootstrap,
  DynamicComponentLoader,
  ElementRef,
  ViewRef,
  NgFor,
  NgIf,
  Injector
} from 'angular2/angular2';

class Schedule {
  _getItems() {
    return JSON.parse(window.localStorage.getItem('schedule') || '[]');
  }

  _setItems(items) {
    window.localStorage.setItem('schedule', JSON.stringify(items));
  }

  add(item) {
    let items = this._getItems();
    items.push(item);
    items.sort((a, b) => parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', '')));

    this._setItems(items);
  }

  remove(idx) {
    let items = this._getItems();
    items.splice(idx, 1);
    this._setItems(items);
  }

  get items() {
    return this._getItems();
  }
}

@Component({
  selector: 'ons-page',
  appInjector: [Schedule]
})
@View({
  template: `
  <ons-page>
    <ons-toolbar>
      <div class="center">Schedule</div>
    </ons-toolbar>

    <ons-list class="plan-list">
      <ons-list-item (press)="schedule.remove(i)" *ng-for="#item of schedule.items; #i = index;" class="plan">
        <ons-row>
          <ons-col width="80px" class="plan-left">
            <div class="plan-date">{{ item.time }}</div>
            <div class="plan-duration">{{ item.duration }}</div>
          </ons-col>

          <ons-col width="6px" class="plan-center">
          </ons-col>

          <ons-col class="plan-right">
            <div class="plan-name">{{ item.title }}</div>

            <div *ng-if="item.location" class="plan-info">
              <div>
                <ons-icon icon="fa-map-marker"></ons-icon>&nbsp;{{ item.location }}
              </div>
            </div>
          </ons-col>
        </ons-row>
      </ons-list-item>
    </ons-list>

  </ons-page>
  `,
  directives: [NgFor, NgIf]
})
class SchedulePage {
  schedule: Schedule;

  constructor(schedule: Schedule) {
    this.schedule = schedule;
  }
}

@Component({
  selector: 'ons-page'
})
@View({
  template: `
  <ons-page>
    <ons-toolbar>
      <div class="center">Add new activity</div>
    </ons-toolbar>
    <ons-list modifier="inset" style="margin-top: 10px">
      <ons-list-item  >
        <input #title (keyup) type="text" class="text-input text-input--transparent" placeholder="Activity" style="width: 100%">
      </ons-list-item>
      <ons-list-item>
        <input #location (keyup) type="text" class="text-input text-input--transparent" placeholder="Location" style="width: 100%">
      </ons-list-item>
      <ons-list-item>
        <select #time class="text-input text-input--transparent" placeholder="Location" style="width: 100%">
          <option *ng-for="#t of times" [value]="t">{{ t }}</option>
        <select>
      </ons-list-item>
    </ons-list>

    <div style="padding: 10px 9px">
      <ons-button (click)="addActivity(title.value, location.value, time.value)" modifier="large" style="margin: 0 auto;">
        Add
      </ons-button>
    </div>
  </ons-page>
  `,
  directives: [NgFor]
})
class AddItemPage {
  times: Array;
  element: ElementRef;
  schedule: Schedule;

  constructor(self: ElementRef, schedule: Schedule) {
    this.element = self;
    this.schedule = schedule;
    this.times = [];

    for (i in Array.from(Array(24))) {
      let h = i > 9 ? i : '0' + i;;
      this.times.push(h + ':00');
      this.times.push(h + ':30');
    }
  }

  get tabbar() {
    let node: HTMLElement = this.element.domElement;
    while ((node = node.parentNode).nodeName !== 'ONS-TABBAR');
    return node;
  }

  addActivity(title, location, time) {
    if (title.length && location.length) {
      this.schedule.add({title: title, location: location, time: time});
      this.tabbar.setActiveTab(0);
    }
  }

}

@Component({
  selector: 'my-app',
  appInjector: [Schedule]
})
@View({
  template: `
    <ons-tabbar animation="slide">
      <ons-tab
        no-reload
        page="schedule.html"
        icon="ion-ios-calendar"
        active="true">
      </ons-tab>
      <ons-tab
        no-reload
        icon="ion-ios-plus-empty"
        page="add.html"></ons-tab>
    </ons-tabbar>
  `
})
class MyAppComponent {
}

bootstrap(MyAppComponent).then(result => {
  var injector: Injector = result.injector;
  var loader: DynamicComponentLoader = injector.get(DynamicComponentLoader);

  var dict = {
    'schedule.html': SchedulePage,
    'add.html': AddItemPage
  };

  OnsTabElement.prototype._createPageElement = function(page, callback) {
    if (dict[page]) {
      loader.loadIntoNewLocation(dict[page], new ElementRef(result._hostComponent.hostView, 0)).then(componentRef => {
        callback(componentRef.location.domElement);
      });
    }
    else {
      throw new Error('Page ' + page + ' does not exist.');
    }
  };
});

