// Domain Layer Abstract class for accessing the Infrastructure layer to get to the Database

class UserRepository {
    async getByUsername(username) {
        throw new Error("Method 'getByUsername()' not implemented");
    }

    async getByUserId(userId) {
        throw new Error("Method 'getByUserId()' not implemented");
    } 

    //return updated User object
    async save(user) {
        throw new Error("Method 'save()' not implemented")
    }

    async deleteUser(user) {
        throw new Error("deleteUser() must be implemented");
    }

    //check if two users are already friends. return value boolean
    async areFriends(usrAId, usrBId) {
        throw new Error("areFriends() must be implemented");
    }

    async getAllUsers() {
        throw new Error("getAllUsers() must be implemented");
    }
}

export default UserRepository;
