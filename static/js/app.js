// 绑定ws消息事件
ws.on('message', function(result) {
  if (result.code === 200) {
    console.log(result.description);
  } else {
    alert(result.description);
    if (result.code === 202) {
      localStorage.removeItem('token');
      window.location.href = '/logout';
    }
  }
});

// 监听用户断开连接事件
ws.on('disconnect', function() {
  console.log('user disconnect!');
  // window.location.reload();
});

ws.on('data', function(data) {
  shouldUpdate(data);
});

function shouldUpdate(data) {
  let currentPath = fetchUrlPath();
  if (data.code === 901 && currentPath === '/') {
    renderProjects(data);
  } else if (data.code === 902) {
    let projectId = data.detail.projectId;
    if (currentPath === `/project/${projectId}`) {
      renderTasks(data);
    }
  } else if (data.code === 910) {
    let task = data.detail.task;
    if (currentPath === `/project/${task.project.id}/task/${task.id}`) {
      renderTask(data);
    }
  } else if (data.code === 913) {
    if (currentPath === '/my_task') {
      renderTasks(data);
    }
  } else if (data.code === 917 && currentPath === '/apidoc') {
    renderApidocs(data);
  } else if (data.code === 919) {
    if (currentPath === `/apidoc/${data.detail.project.id}`) {
      renderApidoc(data);
    }
  } else if (data.code === 921) {
    if (currentPath === '/chat') {
      if (data.detail.users.length > 0) {
        sessionStorage.setItem('users', JSON.stringify(data.detail));
        renderChatUsers();
      }
    }
  } else if (data.code === 924) {
    let openChatUserId = sessionStorage.getItem('openChatUserId');
    if (currentPath === '/chat' && parseInt(openChatUserId) === data.detail.targetUserId) {
      data.detail.chats.reverse();
      sessionStorage.setItem(`chat_${openChatUserId}`, JSON.stringify(data.detail));
      if (openChatUserId !== '0') {
        sessionStorage.setItem(`chat_${data.detail.userId}`, JSON.stringify(data.detail));
      }
      renderChatMessage();
    }
  } else if (data.code === 926) {
    let targetChatObj = JSON.parse(sessionStorage.getItem(`chat_${data.detail.targetUserId}`));
    targetChatObj.chats.push(data.detail.chat);
    sessionStorage.setItem(`chat_${data.detail.targetUserId}`, JSON.stringify(targetChatObj));

    if (data.detail.targetUserId != '0') {
      let chatObj = JSON.parse(sessionStorage.getItem(`chat_${data.detail.userId}`));
      chatObj.chats.push(data.detail.chat);
      sessionStorage.setItem(`chat_${data.detail.userId}`, JSON.stringify(chatObj));
    }

    let openChatUserId = sessionStorage.getItem('openChatUserId');
    if (
      currentPath === '/chat' &&
      (openChatUserId === data.detail.targetUserId || openChatUserId === data.detail.userId)
    ) {
      renderChatMessage();
    }
  }
  $('.spinner').hide();
}

function renderProjects(data) {
  let divs = _.map(data.detail.projects, (project) => {
    return `
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <a data-pjax href="/project/${project.id}">
          <div class="well well-sm" style="background-color: #fff;">
            <h4>${project.name}</h4>
            <p>
              创建人：${project.creatorUser.username}&nbsp;&nbsp;
              任务数：${project.taskCount}
            </p>
            <p>
              ${project.intro ? project.intro : ''}&nbsp;
            </p>
          </div>
        </a>
      </div>`;
  }).join('');
  $('#projects_div').html(divs);
}

function renderTasks(data) {
  let tasks = data.detail.tasks;
  let waitTasks = _.filter(tasks, (task) => task.status === '待处理');
  let processingTasks = _.filter(tasks, (task) => task.status === '进行中');
  let finishTasks = _.filter(tasks, (task) => task.status === '已完成');
  let wait_trs = _.map(waitTasks, (task) => tasksTemplate(task)).join('');
  let processing_trs = _.map(processingTasks, (task) => tasksTemplate(task)).join('');
  let finish_trs = _.map(finishTasks, (task) => tasksTemplate(task)).join('');
  let none_trs = '<tr><td class="text-center">空</td></tr>';
  if (wait_trs.length === 0) wait_trs = none_trs;
  if (processing_trs.length === 0) processing_trs = none_trs;
  if (finish_trs.length === 0) finish_trs = none_trs;
  $('#wait_tasks_table').html(`<tbody>${wait_trs}</tbody>`);
  $('#processing_tasks_table').html(`<tbody>${processing_trs}</tbody>`);
  $('#finish_tasks_table').html(`<tbody>${finish_trs}</tbody>`);
}

function tasksTemplate(task) {
  return `
      <tr draggable="true" data-id="${task.id}">
        <td>
          <a data-pjax href="/project/${task.project.id}/task/${task.id}">
            ${task.name}
            <img src="${task.executorUser.avatar}" width="24" class="pull-right" alt="avatar"/>
          </a>
        </td>
      </tr>
      `;
}

function renderTask(data) {
  let task = data.detail.task;
  let attachments = data.detail.attachments;
  let task_dynamics = data.detail.task_dynamics;
  let project_users = data.detail.project_users;
  $('#task_detail_div').html(`
    <table class="table table-bordered task-detail-table">
      <tbody>
        <tr>
          <th>任务名</th>
          <td colspan=7>${task.name}</td>
        </tr>
        <tr>
          <th>状态</th>
          <td>${task.status}</td>
          <th>创建人</th>
          <td>${task.creatorUser.username}</td>
          <th>执行人</th>
          <td>${task.executorUser.username}</td>
          <th>截止时间</th>
          <td>${task.deadline ? moment(task.deadline).format('YYYY-MM-DD HH:mm:ss') : '无'}</td>
        </tr>
        <tr>
          <th>任务描述</th>
          <td colspan=7>
            ${task.intro ? task.intro : '无'}
          </td>
        </tr>
      </tbody>
    </table>
  `);
  // 渲染附件
  let attachmentLis = _.map(attachments, (item) => {
    let isImage = item.ext === 'jpg' || item.ext === 'jpeg' || item.ext === 'png' || item.ext === 'gif';
    return `
        <li><a href="${item.url}" ${isImage ? 'target="_blank"' : 'download'}>${item.name}</a></li>
      `;
  }).join('');
  if (attachments.length === 0) {
    attachmentLis = `<li>无</li>`;
  }
  $('#task_attachment_div').html(`
    <p><span style="font-size: 18px;">附件</span> <button type="button" class="btn btn-primary btn-xs pull-right" onclick="toUploadFile()">上传附件</button></p>
    <input type="file" class="hidden" id="uploadFileInput" multiple onchange="uploadFile(${task.id})"/>
    <ul style="margin-bottom: 20px;">${attachmentLis}</ul>
  `);
  // 渲染任务动态
  let lis = _.map(
    task_dynamics,
    (item) =>
      `<div>${item.user.username} 在 ${moment(item.createdAt).format(
        'YYYY-MM-DD HH:mm:ss'
      )} <p>${item.content}</p></div>`
  ).join('');
  $('#task_dynamic_div').html(`
    <div class="task-dynamic-div">${lis}</div>
  `);
  // @功能
  let values = _.map(project_users, (item) => {
    return { key: item.user.username, value: item.user.id };
  });
  let tribute = new Tribute({ values: values, selectTemplate: selectTemplate });
  tribute.attach(document.getElementById('content'));
}

// 被@的用户的id
let mentionUserIds = [];

function selectTemplate(item) {
  mentionUserIds.push(item.original.value);
  return '@' + item.original.key;
}

function sendTaskMessage(event) {
  if (event.keyCode === 13) {
    let content = event.target.value;
    let taskId = event.target.getAttribute('data-task-id');
    ws.emit('data', {
      code: 911,
      detail: { taskId: taskId, content: content, mentionUserIds: mentionUserIds }
    });
    event.target.value = '';
    mentionUserIds = [];
  }
}

function renderApidocs(data) {
  let divs = _.map(data.detail.projects, (project) => {
    return `
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <a data-pjax href="/apidoc/${project.id}">
          <div class="well well-sm" style="background-color: #fff;">
            <h4>${project.name}</h4>
            <p>
              创建人：${project.creatorUser.username}&nbsp;&nbsp;
            </p>
            <p>
              ${project.intro ? project.intro : ''}&nbsp;
            </p>
          </div>
        </a>
      </div>`;
  }).join('');
  $('#projects_div').html(divs);
}

function renderApidoc(data) {
  $('#apidoc_list_div').html(`
    ${_.map(
      data.detail.apidocs,
      (item) => `
      <a class="list-group-item" href="javascript:;" onclick="showApidocDetail('${item.id}')">
        ${item.name}
        <button class="btn btn-danger btn-xs pull-right" type="button" onclick="deleteApidoc('${item.id}', '${item
        .project.id}')">删除</button>
      </a>
    `
    ).join('')}`);
  $('#apidoc_detail_div').html(
    _.map(data.detail.apidocs, (item, index) => {
      let paramsHtml = _.map(
        JSON.parse(item.params),
        (item) => `<li>${item.paramName}&nbsp;&nbsp;${item.paramType}&nbsp;&nbsp;${item.paramIntro}</li>`
      ).join('');
      let isHidden = index === 0 ? '' : 'hidden';
      return `
      <table class="table table-bordered ${isHidden}" id="apidoc_detail_table_${item.id}">
        <tbody>
          <tr>
            <th>名称</th>
            <td>${item.name}</td>
          </tr>
          <tr>
            <th>请求类型</th>
            <td>${item.method}</td>
          </tr>
          <tr>
            <th>请求地址</th>
            <td>${item.project.baseUrl}${item.path}</td>
          </tr>
          <tr>
            <th>请求参数</th>
            <td>
              <ul>
                ${paramsHtml}
              </ul>
            </td>
          </tr>
          <tr>
            <th>返回值</th>
            <td><pre><code>${item.returnContent}</code></pre></td>
          </tr>
        </tbody>
      </table>
    `;
    })
  );
}

function showApidocDetail(id) {
  $.each($('#apidoc_detail_div>table'), (index, item) => $(item).addClass('hidden'));
  $(`#apidoc_detail_table_${id}`).removeClass('hidden');
}

function deleteApidoc(id, projectId) {
  if (confirm('确定要删除这个文档吗？')) {
    ws.emit('data', { code: 920, detail: { id: id, projectId: projectId } });
  }
}

let paramsTemplate = `
  <div class="row" style="margin: 5px 0;">
    <div class="col-md-1 text-right text-danger" style="margin-top: 7px; cursor: pointer;">
      <span class="glyphicon glyphicon-remove" onclick="removeParamsRow(this)"></span>
    </div>
    <div class="col-md-3">
      <input type="text" name="paramName" class="form-control" placeholder="参数名"/>
    </div>
    <div class="col-md-3">
      <select name="paramType" class="form-control">
        <option value="String">string</option>
        <option value="int">int</option>
        <option value="file">file</option>
        <option value="boolean">boolean</option>
        <option value="double">double</option>
        <option value="float">float</option>
        <option value="char">char</option>
      </select>
    </div>
    <div class="col-md-5">
      <input type="text" name="paramIntro" class="form-control" placeholder="参数说明"/>
    </div>
  </div>
`;
function addParamsRow() {
  $('#params_div').append(paramsTemplate);
}
function removeParamsRow(_this) {
  $(_this).parent().parent().remove();
}

function toUploadFile() {
  $('#uploadFileInput').click();
}

function uploadFile(id) {
  let files = document.getElementById('uploadFileInput').files;
  let fd = new FormData();
  fd.append('taskId', id);
  //fd.append('files', files);
  for (let i = 0; i < files.length; i++) {
    fd.append(`files`, files[i]);
  }
  $.post({
    url: '/uploadFile',
    data: fd,
    dataType: 'json',
    processData: false,
    contentType: false,
    success: function(data) {
      if (data.code === 200) {
        // 上传成功，通知其它用户
        ws.emit('data', {
          code: 911,
          detail: {
            taskId: id,
            content: `${sessionStorage.getItem('username')}添加了${files.length}个附件`,
            mentionUserIds: []
          }
        });
      } else {
        alert(data.description);
      }
    }
  });
}

function renderChatUsers() {
  let data = JSON.parse(sessionStorage.getItem('users'));
  let userId = sessionStorage.getItem('userId');
  let users = _.filter(data.users, (item) => item.id !== parseInt(userId));
  let user_divs = _.map(
    users,
    (item) => `
    <div class="chat_user_div" data-id='${item.id}' onclick="openChat(${item.id})">
      <div>
        <span ${item.online ? 'style="color: greenyellow"' : 'style="color: gray"'}>•</span>
        <img src="${item.avatar}" width="24" height="24" alt=""/>&nbsp;
        <span>${item.username}</span>
      </div>
      <div>${item.department ? item.department.name : '&nbsp;'}</div>
    </div>
  `
  ).join('');
  $('.chat_sidebar').html(`
    <div class="chat_user_div" data-id='0' onclick="openChat(0)">
      <div>
        <span style="color: greenyellow">•</span>
        <span>广播室</span>
      </div>
      <div>&nbsp;</div>
    </div>
    ${user_divs}
  `);
  let openChatUserId = sessionStorage.getItem('openChatUserId');
  if (openChatUserId) {
    $(`.chat_user_div[data-id='${openChatUserId}']`).click();
  } else {
    $('.chat_sidebar div:eq(0)').click();
  }
}

function openChat(id) {
  sessionStorage.setItem('openChatUserId', id);
  ws.emit('data', {
    code: 923,
    detail: { pageNo: 1, beforeId: 0, userId: sessionStorage.getItem('userId'), targetUserId: id }
  });
  $.each($(`.chat_user_div`), function(index, item) {
    $(item).css('background-color', '#fff');
  });
  $(`.chat_user_div[data-id='${id}']`).css('background-color', '#eee');
}

function renderChatMessage() {
  let data = JSON.parse(sessionStorage.getItem(`chat_${sessionStorage.getItem('openChatUserId')}`));
  let message_divs = _.map(data.chats, (item) => {
    let mine = parseInt(data.userId) === parseInt(item.user.id);
    if (mine) {
      return `
        <div class="text-right" style="margin: 10px 0;">
          <div class="chat_user_info">${moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            ${item.user.username}
            <img src="${item.user.avatar}" width="24" style="border-radius: 50%;" alt=""/>
          </div>
          <div class="chat_content">${item.content}</div>
        </div>
      `;
    } else {
      return `
        <div style="margin: 10px 0;">
          <div class="chat_user_info">
          <img src="${item.user.avatar}" width="24" style="border-radius: 50%;" alt=""/>
          ${item.user.username}
          ${moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div class="chat_content">${item.content}</div>
        </div>
      `;
    }
  });
  $('.chat_message').html(message_divs);
  $('.chat_message').animate({ scrollTop: $('.chat_message')[0].scrollHeight }, 200);
}
