function fetchUrlPath() {
  var url = document.location.toString();
  var arrUrl = url.split('//');

  var start = arrUrl[1].indexOf('/');
  var relUrl = arrUrl[1].substring(start); //stop省略，截取从start开始到结尾的所有字符

  if (relUrl.indexOf('?') != -1) {
    relUrl = relUrl.split('?')[0];
  }
  return relUrl;
}

function dragTask() {
  let wait_tasks_table_ele = document.getElementById('wait_tasks_table');
  let processing_tasks_table_ele = document.getElementById('processing_tasks_table');
  let finish_tasks_table_ele = document.getElementById('finish_tasks_table');
  let wait_tasks_div_ele = document.getElementById('wait_tasks_div');
  let processing_tasks_div_ele = document.getElementById('processing_tasks_div');
  let finish_tasks_div_ele = document.getElementById('finish_tasks_div');
  // 判断能否获取到元素
  if (wait_tasks_div_ele) {
    wait_tasks_table_ele.ondragstart = function(ev) {
      let taskId = ev.srcElement.getAttribute('data-id');
      ev.dataTransfer.setData('taskId', `${taskId}`);
    };
    processing_tasks_table_ele.ondragstart = function(ev) {
      let taskId = ev.srcElement.getAttribute('data-id');
      ev.dataTransfer.setData('taskId', `${taskId}`);
    };
    finish_tasks_div_ele.ondragstart = function(ev) {
      let taskId = ev.srcElement.getAttribute('data-id');
      ev.dataTransfer.setData('taskId', `${taskId}`);
    };

    // 松手后事件
    wait_tasks_div_ele.ondrop = function(ev) {
      ev.preventDefault();
      let taskId = ev.dataTransfer.getData('taskId');
      ws.emit('data', { code: 907, detail: { taskId: taskId, status: '待处理'} });
    };

    // 松手后事件
    processing_tasks_div_ele.ondrop = function(ev) {
      ev.preventDefault();
      let taskId = ev.dataTransfer.getData('taskId');
      ws.emit('data', { code: 907, detail: { taskId: taskId, status: '进行中'} });
    };

    // 松手后事件
    finish_tasks_div_ele.ondrop = function(ev) {
      ev.preventDefault();
      let taskId = ev.dataTransfer.getData('taskId');
      ws.emit('data', { code: 907, detail: { taskId: taskId, status: '已完成' } });
    };

    // 待处理事件
    wait_tasks_div_ele.ondragenter = function(ev) {
      ev.preventDefault();
      let temptr = document.createElement('tr');
      let temptd = document.createElement('td');
      temptr.setAttribute('class', 'wait-append-tr');
      temptd.innerHTML = 'drop';
      temptr.appendChild(temptd);
      let firsttr = wait_tasks_table_ele.firstChild;
      if (firsttr.textContent.trim() !== 'drop') {
        wait_tasks_table_ele.insertBefore(temptr, firsttr);
      }
    };

    wait_tasks_div_ele.ondragleave = function(ev) {
      ev.preventDefault();
      let firsttr = wait_tasks_table_ele.firstChild;
      if (firsttr.textContent.trim() === 'drop') {
        wait_tasks_table_ele.removeChild(firsttr);
      }
    };

    wait_tasks_div_ele.ondragover = function(ev) {
      ev.preventDefault();
    };

    wait_tasks_div_ele.ondragend = function(ev) {
      ev.preventDefault();
    };

    wait_tasks_div_ele.ondragexit = function(ev) {
      ev.preventDefault();
    };

    // 进行中事件
    processing_tasks_div_ele.ondragenter = function(ev) {
      ev.preventDefault();
      let temptr = document.createElement('tr');
      let temptd = document.createElement('td');
      temptr.setAttribute('class', 'wait-append-tr');
      temptd.innerHTML = 'drop';
      temptr.appendChild(temptd);
      let firsttr = processing_tasks_table_ele.firstChild;
      if (firsttr.textContent.trim() !== 'drop') {
        processing_tasks_table_ele.insertBefore(temptr, firsttr);
      }
    };

    processing_tasks_div_ele.ondragleave = function(ev) {
      ev.preventDefault();
      let firsttr = processing_tasks_table_ele.firstChild;
      if (firsttr.textContent.trim() === 'drop') {
        processing_tasks_table_ele.removeChild(firsttr);
      }
    };

    processing_tasks_div_ele.ondragover = function(ev) {
      ev.preventDefault();
    };

    processing_tasks_div_ele.ondragend = function(ev) {
      ev.preventDefault();
    };

    processing_tasks_div_ele.ondragexit = function(ev) {
      ev.preventDefault();
    };

    // 已完成事件
    finish_tasks_div_ele.ondragenter = function(ev) {
      ev.preventDefault();
      let temptr = document.createElement('tr');
      let temptd = document.createElement('td');
      temptr.setAttribute('class', 'wait-append-tr');
      temptd.innerHTML = 'drop';
      temptr.appendChild(temptd);
      let firsttr = finish_tasks_table_ele.firstChild;
      if (firsttr.textContent.trim() !== 'drop') {
        finish_tasks_table_ele.insertBefore(temptr, firsttr);
      }
    };

    finish_tasks_div_ele.ondragleave = function(ev) {
      ev.preventDefault();
      let firsttr = finish_tasks_table_ele.firstChild;
      if (firsttr.textContent.trim() === 'drop') {
        finish_tasks_table_ele.removeChild(firsttr);
      }
    };

    finish_tasks_div_ele.ondragover = function(ev) {
      ev.preventDefault();
    };

    finish_tasks_div_ele.ondragend = function(ev) {
      ev.preventDefault();
    };

    finish_tasks_div_ele.ondragexit = function(ev) {
      ev.preventDefault();
    };
  }
}
