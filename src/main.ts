import './style.css'

interface Task {
  floor: number;
  direction: 'up' | 'down';
}

class Lift {
  private currentFloor: number;
  private direction: 'up' | 'down' | 'idle';
  private _isRunning: boolean;
  
  constructor(
    currentFloor: number,
     direction: 'up' | 'down' | 'idle',
  ) {
    this.currentFloor = currentFloor;
    this.direction = direction;
    this._isRunning = false;
  }

  public requestToMove(floor: number) {
    if (floor > this.currentFloor) {
      this.direction = 'up'
    } else if (floor < this.currentFloor) {
      this.direction = 'down'
    } else {
      this.direction = 'idle'
    }
    this._isRunning = true
    console.log(`Lift is moving to floor ${floor}`)
  }

  public isRunning() {
    return this._isRunning;
  }

  public getCurrentFloor() {
    return this.currentFloor;
  }

  private sendLiftToFloor(floor: number) {
    this.currentFloor = floor;
    this._isRunning = false;
    console.log(`Lift is at floor ${floor}`)
  }

  private animateLift(){}

  public postCompletion(cb: () => void) {
    cb();
  }
}

class Floor {
  private isTop: boolean;
  private isGround: boolean;
  private floorNumber: number;
  private assignTask: (task: Task) => void;

  constructor(
    isTop: boolean,
    isGround: boolean,
    floorNumber: number,
    assignTask: (task: Task) => void,
  ) {
    this.isTop = isTop;
    this.isGround = isGround;
    this.floorNumber = floorNumber;
    this.assignTask = assignTask;
  }

  public getFloorElement() {
    const floorEl = document.createElement("div");
    floorEl.setAttribute("class", "floor-container");
    floorEl.setAttribute("id", `floor-${this.floorNumber}`);
    const floorTitleEl = document.createElement("div");
    floorTitleEl.innerHTML = `<h2>Floor ${this.floorNumber}</h2>`;
    floorEl.appendChild(floorTitleEl);
      
    const liftButtonsEl = document.createElement("div");
    liftButtonsEl.setAttribute("class", "lift-buttons");
    liftButtonsEl.setAttribute("id", `floor-button-${this.floorNumber}`);
    if (!this.isGround) {
      const liftCallBtn = this.createButton("up");
      liftButtonsEl.appendChild(liftCallBtn);
    }
    if (!this.isTop) {
      const liftCallBtn = this.createButton("down");
      liftButtonsEl.appendChild(liftCallBtn);
    }
    floorEl.appendChild(liftButtonsEl);
    return floorEl;
  }

  private createButton(direction: "up"|"down") {
    const button = document.createElement('button');
    button.onclick = () => this.assignTask({ floor: this.floorNumber, direction }); 
    button.setAttribute('type', 'button');
    button.innerText = direction === 'up' ? '🔼' : '🔽';
    return button;
  }
}

class Building {
  private floors: Floor[];
  private lifts: Lift[];
  private taskQueue: Task[];

  constructor(
    numberOfFloors: number,
    numberOfLifts: number,
  ) {
    this.taskQueue = [];
    this.init(numberOfFloors, numberOfLifts);
  }

  private init(numberOfFloors:number, numberOfLifts:number){
    this.floors = [];
    this.lifts = [];
    this.createFloors(numberOfFloors)
    this.createLift()

  }

  private createFloors(numberOfFloors: number) {
    for (let i = 0; i < numberOfFloors; i++) {
      const isTop = i === numberOfFloors - 1;
      const isGround = i === 0;
      const floor = new Floor(isTop, isGround, numberOfFloors - i);
      this.floors.push(floor);
    }
  }

  private createLifts(numberOfLifts: number) {
    for (let i = 0; i < numberOfLifts; i++) {
      const lift = new Lift(0, 'idle');
      this.lifts.push(lift);
    }
  }

  // public requestLift(floor: number) {
  //   this.lift.requestToMove(floor);
  //   this.animateLift();
  // }

  // private animateLift() {
  //   const lift = document.querySelector('.lift');
  //   if (lift) {
  //     lift.style.transform = `translateY(${(this.lift.getCurrentFloor() - 1) * 100}px)`;
  //   }
  //   this.lift.postCompletion(() => {
  //     this.lift.sendLiftToFloor(this.lift.getCurrentFloor());
  //   });
  // }

  public renderBuilding(){
    const building = document.createElement('div');
    building.classList.add('building');
    this.floors.forEach((floor) => {
      building.appendChild(floor.createFloor());
    });
    document.body.appendChild(building);
  }

  private findNearestLift(targetFloor: number, direction: 'up'|'down'):number{
    let nearestLiftIndex = -1;
    let minDistance = Infinity;
    this.lifts.forEach((lift, index) => {
      const distance = Math.abs(lift.getCurrentFloor() - targetFloor);
      if (distance < minDistance && lift.direction === direction) {
        minDistance = distance;
        nearestLiftIndex = index;
      }
    });
    return nearestLiftIndex;
  }

  private assignTask(task: Task) {
    const nearestLiftIndex = this.findNearestLift(task.floor, task.direction);
    if (nearestLiftIndex !== -1) {
      const lift = this.lifts[nearestLiftIndex];
      lift.requestToMove(task.floor);
      // this.animateLift();
    } else {
      this.taskQueue.push(task);
    }
  }

  private processTask() {
    this.taskQueue.forEach((task) => {
      this.assignTask(task);
    });
    this.taskQueue = [];
  }

  private liftCompletionTask() {
    this.lifts.forEach((lift) => {
      if (!lift.isRunning()) {
        this.processTask();
      }
    });
  }
}