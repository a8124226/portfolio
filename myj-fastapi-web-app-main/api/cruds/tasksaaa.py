from sqlalchemy import text
from sqlalchemy.orm import Session


def create_task(
    db: Session,
    task_create: dict,
    user_id: int,
):
    sql = text(
        """
        INSERT INTO tasksaaa (id, title, due_date, body, img_path, user_id)
        VALUES (:id, :title, :due_date, :body, :img_path, :user_id)
        """
    )
    params = {
        "id":task_create.get("id"),
        "title":task_create.get("title"),
        "due_date": task_create.get("due_date"),
        "body":task_create.get("body"),
        "img_path":task_create.get("img_path"),
        "user_id": user_id,
    }

    print(f"SQL: {sql}\nParams: {params}")
    res = db.execute(sql, params)
    db.commit()
    new_task_id = res.lastrowid  # DBが最後に挿入した行のIDを取得
    new_task = get_task(db, task_id=new_task_id)
    print(f"DB操作の結果: {new_task}")

    return new_task


def get_task(
    db: Session,
    task_id: int,
):
    sql = text(
        """
        SELECT * FROM tasksaaa
        WHERE id = :id
        """
    )
    params = {"id": task_id}

    print(f"SQL: {sql}\nParams: {params}")
    result = db.execute(sql, params).first()
    if result is not None:
        result = result._asdict()
    print(f"DB操作の結果: {result}")

    return result


def get_task_with_done(
    db: Session,
    task_id: int,
):
    sql = text(
        """
        SELECT
            tasksaaa.id,
            tasksaaa.title,
            tasksaaa.body,
            tasksaaa.due_date,
            tasksaaa.user_id,
            tasksaaa.img_path,
            dones.id IS NOT NULL AS done
        FROM tasksaaa
        LEFT JOIN dones ON tasksaaa.id = dones.id
        WHERE tasksaaa.id = :id
        """
    )
    params = {"id": task_id}

    print(f"SQL: {sql}\nParams: {params}")
    result = db.execute(sql, params).first()
    if result is not None:
        result = result._asdict()
        result["done"] = bool(result["done"])
    print(f"DB操作の結果: {result}")

    return result


def get_multiple_tasks_with_done(
    db: Session,
    user_id: int,
):
    sql = text(
        """
        SELECT
            tasksaaa.id,
            tasksaaa.title,
            tasksaaa.due_date,
            tasksaaa.body,
            tasksaaa.user_id,
            tasksaaa.img_path
        FROM tasksaaa
        """
    )
    params = {"user_id": user_id}

    print(f"SQL: {sql}\nParams: {params}")
    result = db.execute(sql, params).all()
    result = [task._asdict() for task in result]
    print(f"DB操作の結果: {result}")

    return result


def update_task(
    db: Session,
    task_update: dict,
    original: dict,
):
    sql = text(
        """
        UPDATE tasksaaa
        SET  title = :title, due_date = :due_date, body = body, img_path = :img_path
        WHERE id = :id
        """
    )
    params = original.copy()
    print(f"元のデータ, update_task: {params}")
    print(f"更新するデータ: {task_update}")
    
    if task_update.get("title") is not None:
        params["title"] = task_update.get("title")
    if task_update.get("due_date") is not None:
        params["due_date"] = task_update.get("due_date")
    if task_update.get("body") is not None:
        params["body"] = task_update.get("body")
    if task_update.get("img_path") is not None:
        params["img_path"] = task_update.get("img_path")

    print(f"SQL: {sql}\nParams: {params}")
    db.execute(sql, params)
    db.commit()
    updated_task = get_task(db, task_id=original.get("id"))
    print(f"DB操作の結果: {updated_task}")

    return updated_task


def delete_task(db: Session, original: dict):
    sql = text(
        """
        DELETE FROM tasksaaa
        WHERE id = :id
        """
    )
    params = {
        "id": original.get("id"),
    }

    print(f"SQL: {sql}\nParams: {params}")
    db.execute(sql, params)
    db.commit()
