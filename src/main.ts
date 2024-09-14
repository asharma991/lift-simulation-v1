interface Task {
  floor: number;
  direction: 'up' | 'down';
}

class Lift {
  private currentFloor: number;
  // private direction: 'up' | 'down' | 'idle';
  private _isRunning: boolean;
  public name: string;
  private cb: () => void;

  constructor(
    currentFloor: number,
    // direction: 'up' | 'down' | 'idle',
    name: string,
    cb: () => void,
  ) {
    this.currentFloor = currentFloor;
    // this.direction = direction;
    this._isRunning = false;
    this.name = name;
    this.cb = cb;
  }

  public requestToMove(floor: number) {
    // if (floor > this.currentFloor) {
    //   this.direction = 'up'
    // } else if (floor < this.currentFloor) {
    //   this.direction = 'down'
    // } else {
    //   this.direction = 'idle'
    // }
    this._isRunning = true
    this.sendLiftToFloor(floor);
  }

  public isRunning() {
    return this._isRunning;
  }

  public getCurrentFloor() {
    return this.currentFloor;
  }

  private sendLiftToFloor(floor: number) {
    const liftEl = document.getElementById(this.name);
    const targetFloorEl = document.getElementById(`floor-${floor}`);
    if (liftEl && targetFloorEl) {
      const handleAnimationEnd = () => {
        this._isRunning = false;
        this.postCompletion(this.cb);
      }
      const liftAnimationPromise = liftEl.animate([
        { transform: `translateY(${-((floor - 1) * (targetFloorEl.offsetHeight + 20))}px)` }
      ], {
        duration: 2000,
        easing: 'ease-in-out',
        fill: 'forwards'
      })
      liftAnimationPromise.onfinish = () => {
        this.currentFloor = floor;
        this.animateLift(handleAnimationEnd, liftEl);
      }

    }
  }

  private animateLift(animationEndCB:
    () => void, liftEl: HTMLElement
  ): void {
    const leftDoor = liftEl?.children[0];
    const rightDoor = liftEl?.children[1];
    const leftDoorKeyframes = [
      { marginRight: '0%' },
      { marginRight: '50%' },
      { marginRight: '0%' }
    ];

    const rightDoorKeyframes = [
      { marginLeft: '0%' },
      { marginLeft: '50%' },
      { marginLeft: '0%' }
    ];

    const animationPromiseLeft = leftDoor.animate(leftDoorKeyframes, {
      duration: 5000,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
    const animationPromiseRight = rightDoor.animate(rightDoorKeyframes, {
      duration: 5000,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
    animationPromiseLeft.onfinish = () => {
      animationEndCB()
    }
    animationPromiseRight.onfinish = () => {
      animationEndCB()
    }
    setTimeout(() => {
      animationPromiseLeft.finish();
      animationPromiseRight.finish();
    }, 5000)
  }

  private postCompletion(cb: () => void) {
    cb();
  }

  public createLift() {
    const liftName = this.name;
    const liftEl = document.createElement('div');
    liftEl.setAttribute('class', 'lift');
    liftEl.setAttribute('id', liftName);
    liftEl.innerHTML = `
        <div class="left-door"></div>
        <div class="right-door"></div>
      `;
    return liftEl;
  }
}

class Floor {
  private isTop: boolean;
  private isGround: boolean;
  private floorNumber: number;
  private assignTask: (task: Task) => void;
  private floorEl: HTMLDivElement;

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
    this.floorEl = this.getFloorElement();
  }

  private getFloorElement() {
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

  private createButton(direction: "up" | "down") {
    const button = document.createElement('button');
    button.onclick = () => this.assignTask({ floor: this.floorNumber, direction });
    button.setAttribute('type', 'button');
    button.innerText = direction === 'up' ? '🔼' : '🔽';
    return button;
  }

  public getFloor() {
    return { floorEl: this.floorEl, floorNumber: this.floorNumber };
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
    this.floors = [];
    this.lifts = [];
    this.taskQueue = [];
    this.init(numberOfFloors, numberOfLifts);
  }

  private init(numberOfFloors: number, numberOfLifts: number) {
    this.createFloors(numberOfFloors)
    this.createLifts(numberOfLifts)

  }

  private createFloors(numberOfFloors: number) {
    for (let i = numberOfFloors; i > 0; i--) {
      const isTop = i === numberOfFloors;
      const isGround = i === 1;
      const floor = new Floor(isTop, isGround, i, this.assignTask.bind(this));
      this.floors.push(floor);
    }
  }

  private createLifts(numberOfLifts: number) {
    for (let i = 0; i < numberOfLifts; i++) {
      const lift = new Lift(0, `lift-${i}`, this.processTask.bind(this));
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

  public renderBuilding() {
    const building = document.createElement('div');
    building.classList.add('building');
    const floorContainerEl = document.createElement('div');
    floorContainerEl.setAttribute("class", "floors");
    this.floors.forEach((floor, idx) => {
      const floorEl = floor.getFloor().floorEl;
      this.lifts.forEach((lift) => {
        if (idx === this.floors.length - 1) { floorEl.appendChild(lift.createLift()); }
      });
      floorContainerEl.appendChild(floorEl);
    });
    building.appendChild(floorContainerEl);
    const simulationContainer: any = document.getElementById("simulation-container");
    simulationContainer.innerHTML = "";
    simulationContainer.appendChild(building);
  }

  private findNearestLift(targetFloor: number): number {
    let nearestLiftIndex = -1;
    let minDistance = Infinity;
    this.lifts.forEach((lift, index) => {
      const distance = Math.abs(lift.getCurrentFloor() - targetFloor);
      console.log({ distance, lift , isRunning: lift.isRunning()})
      if (distance < minDistance && !lift.isRunning()) {
        minDistance = distance;
        nearestLiftIndex = index;
      }
    });
    return nearestLiftIndex;
  }

  private assignTask(task: Task) {
    const nearestLiftIndex = this?.findNearestLift(task.floor);
    if (nearestLiftIndex !== -1) {
      const lift = this.lifts[nearestLiftIndex];
      lift.requestToMove(task.floor);
      // this.animateLift();
    } else {
      this.taskQueue.push(task);
    }
  }

  private processTask() {
    const dequedTask = this.taskQueue.shift();
    if (dequedTask) {
      this.assignTask(dequedTask);
    } else {
      console.log('No tasks in the queue');
    }
  }
}

//ignore typescript for the below function
//@ts-ignore
function startSimulation(event: Event) {
  event.preventDefault();
  const floorsInput: any = document.getElementById("floor-nums");
  const liftsInput: any = document.getElementById("lift-nums");
  const floors = floorsInput.value;
  const lifts = liftsInput.value;
  const building = new Building(parseInt(floors), parseInt(lifts));
  building.renderBuilding();
}