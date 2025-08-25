from ArguMem.db import init_db


if __name__ == "__main__":
    init_db().close()
    print("Initialized argumem.db")