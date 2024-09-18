var Lift = /** @class */ (function () {
  function Lift(currentFloor,
    // direction: 'up' | 'down' | 'idle',
    name, cb) {
    this.currentFloor = currentFloor;
    // this.direction = direction;
    this._isRunning = false;
    this.name = name;
    this.cb = cb;
  }
  Lift.prototype.requestToMove = function (floor) {
    // if (floor > this.currentFloor) {
    //   this.direction = 'up'
    // } else if (floor < this.currentFloor) {
    //   this.direction = 'down'
    // } else {
    //   this.direction = 'idle'
    // }
    this._isRunning = true;
    this.sendLiftToFloor(floor);
  };
  Lift.prototype.isRunning = function () {
    return this._isRunning;
  };
  Lift.prototype.getCurrentFloor = function () {
    return this.currentFloor;
  };
  Lift.prototype.sendLiftToFloor = function (floor) {
    var _this = this;
    var liftEl = document.getElementById(this.name);
    var targetFloorEl = document.getElementById("floor-".concat(floor));
    if (liftEl && targetFloorEl) {
      var handleAnimationEnd_1 = function () {
        _this._isRunning = false;
        _this.postCompletion(_this.cb);
      };
      var liftAnimationPromise = liftEl.animate([
        { transform: "translateY(".concat(-((floor - 1) * (targetFloorEl.offsetHeight + 20)), "px)") }
      ], {
        duration: Math.abs(floor - this.currentFloor) * 2000,
        easing: 'ease-in-out',
        fill: 'forwards'
      });
      var onFinishAnimation = function () {
        _this.currentFloor = floor;
        _this.animateLift(handleAnimationEnd_1.bind(_this), liftEl);
      };
      liftAnimationPromise.onfinish = onFinishAnimation.bind(this);
    }
  };
  Lift.prototype.animateLift = function (animationEndCB, liftEl) {
    var leftDoor = liftEl === null || liftEl === void 0 ? void 0 : liftEl.children[0];
    var rightDoor = liftEl === null || liftEl === void 0 ? void 0 : liftEl.children[1];
    var leftDoorKeyframes = [
      { marginRight: '0%' },
      { marginRight: '50%' },
      { marginRight: '0%' }
    ];
    var rightDoorKeyframes = [
      { marginLeft: '0%' },
      { marginLeft: '50%' },
      { marginLeft: '0%' }
    ];
    var animationPromiseLeft = leftDoor.animate(leftDoorKeyframes, {
      duration: 5000,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
    rightDoor.animate(rightDoorKeyframes, {
      duration: 5000,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
    animationPromiseLeft.onfinish = function () {
      animationEndCB();
    };
    // setTimeout(() => {
    //   animationPromiseLeft.finish();
    //   animationPromiseRight.finish();
    // }, 5000)
  };
  Lift.prototype.postCompletion = function (cb) {
    cb();
  };
  Lift.prototype.createLift = function () {
    var liftName = this.name;
    var liftEl = document.createElement('div');
    liftEl.setAttribute('class', 'lift');
    liftEl.setAttribute('id', liftName);
    liftEl.innerHTML = "\n        <div class=\"left-door\"></div>\n        <div class=\"right-door\"></div>\n      ";
    return liftEl;
  };
  return Lift;
}());
var Floor = /** @class */ (function () {
  function Floor(isTop, isGround, floorNumber, assignTask) {
    this.isTop = isTop;
    this.isGround = isGround;
    this.floorNumber = floorNumber;
    this.assignTask = assignTask;
    this.floorEl = this.getFloorElement();
  }
  Floor.prototype.getFloorElement = function () {
    var floorEl = document.createElement("div");
    floorEl.setAttribute("class", "floor-container");
    floorEl.setAttribute("id", "floor-".concat(this.floorNumber));
    var floorTitleEl = document.createElement("div");
    floorTitleEl.innerHTML = "<h2>Floor ".concat(this.floorNumber, "</h2>");
    floorEl.appendChild(floorTitleEl);
    var liftButtonsEl = document.createElement("div");
    liftButtonsEl.setAttribute("class", "lift-buttons");
    liftButtonsEl.setAttribute("id", "floor-button-".concat(this.floorNumber));
    if (!this.isGround) {
      var liftCallBtn = this.createButton("up");
      liftButtonsEl.appendChild(liftCallBtn);
    }
    if (!this.isTop) {
      var liftCallBtn = this.createButton("down");
      liftButtonsEl.appendChild(liftCallBtn);
    }
    floorEl.appendChild(liftButtonsEl);
    return floorEl;
  };
  Floor.prototype.createButton = function (direction) {
    var _this = this;
    var button = document.createElement('button');
    button.onclick = function () { return _this.assignTask({ floor: _this.floorNumber, direction: direction }); };
    button.setAttribute('type', 'button');
    button.innerText = direction === 'up' ? '🔼' : '🔽';
    return button;
  };
  Floor.prototype.getFloor = function () {
    return { floorEl: this.floorEl, floorNumber: this.floorNumber };
  };
  return Floor;
}());
var Building = /** @class */ (function () {
  function Building(numberOfFloors, numberOfLifts) {
    this.floors = [];
    this.lifts = [];
    this.taskQueue = [];
    this.init(numberOfFloors, numberOfLifts);
  }
  Building.prototype.init = function (numberOfFloors, numberOfLifts) {
    this.createFloors(numberOfFloors);
    this.createLifts(numberOfLifts);
  };
  Building.prototype.createFloors = function (numberOfFloors) {
    for (var i = numberOfFloors; i > 0; i--) {
      var isTop = i === numberOfFloors;
      var isGround = i === 1;
      var floor = new Floor(isTop, isGround, i, this.assignTask.bind(this));
      this.floors.push(floor);
    }
  };
  Building.prototype.createLifts = function (numberOfLifts) {
    for (var i = 1; i <= numberOfLifts; i++) {
      var lift = new Lift(1, "lift-".concat(i), this.processTask.bind(this));
      this.lifts.push(lift);
    }
  };
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
  Building.prototype.renderBuilding = function () {
    var _this = this;
    var building = document.createElement('div');
    building.classList.add('building');
    var floorContainerEl = document.createElement('div');
    floorContainerEl.setAttribute("class", "floors");
    this.floors.forEach(function (floor, idx) {
      var floorEl = floor.getFloor().floorEl;
      _this.lifts.forEach(function (lift) {
        if (idx === _this.floors.length - 1) {
          floorEl.appendChild(lift.createLift());
        }
      });
      floorContainerEl.appendChild(floorEl);
    });
    building.appendChild(floorContainerEl);
    var simulationContainer = document.getElementById("simulation-container");
    simulationContainer.innerHTML = "";
    simulationContainer.appendChild(building);
  };
  Building.prototype.findNearestLift = function (targetFloor) {
    var nearestLiftIndex = -1;
    var minDistance = Infinity;
    var liftInCurrentFloor = false;
    // check if there are any requests for the same floor in the task queue
    this.taskQueue.forEach(function (task, index) {
      if (task.floor === targetFloor) {
        liftInCurrentFloor = true;
      }
    });
    this.lifts.forEach(function (lift, index) {
      var distance = Math.abs(lift.getCurrentFloor() - targetFloor);
      if (distance === 0) {
        liftInCurrentFloor = true;
      }
      console.log({ distance: distance, lift: lift, isRunning: lift.isRunning() });
      if (distance < minDistance && !lift.isRunning()) {
        minDistance = distance;
        nearestLiftIndex = index;
      }
    });
    if (liftInCurrentFloor)
      return -2;
    return nearestLiftIndex;
  };
  Building.prototype.assignTask = function (task) {
    var nearestLiftIndex = this === null || this === void 0 ? void 0 : this.findNearestLift(task.floor);
    if (nearestLiftIndex !== -1) {
      var lift = this.lifts[nearestLiftIndex];
      lift.requestToMove(task.floor);
      // this.animateLift();
    } else if (nearestLiftIndex !== -2) {
      this.taskQueue.unshift(task);
    }
    else {
      console.log('No lift available');
    }
  };
  Building.prototype.processTask = function () {
    console.log({ tq: this.taskQueue.length });
    var dequedTask = this.taskQueue.shift();
    if (dequedTask) {
      this.assignTask(dequedTask);
    }
    else {
      console.log('No tasks in the queue');
    }
  };
  return Building;
}());
function startSimulation(event) {
  event.preventDefault();
  var floorsInput = document.getElementById("floor-nums");
  var liftsInput = document.getElementById("lift-nums");
  // if the number of lifts is greater than number of floors then give an alert saying lifts can't be greater than the floors and on click of okay on that alert, refresh the page
  if (parseInt(liftsInput.value) > parseInt(floorsInput.value)) {
    alert("Lifts can't be more than the number of floors");
    return;
  }
  var floors = floorsInput.value;
  var lifts = liftsInput.value;
  var building = new Building(parseInt(floors), parseInt(lifts));
  building.renderBuilding();
}
