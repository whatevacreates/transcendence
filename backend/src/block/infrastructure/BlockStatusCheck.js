import BlockServicePort from "../../chat/application/BlockServicePort";

class BlockStatusCheck extends BlockServicePort {
    constructor (blockRepository) {
        super();
        this.blockRepository=  blockRepository;
    }

    async isBlocked (userIdA, userIdB) {
        return await this.blockRepository.isBlocked(userIdA, userIdB);
    }
}

export default BlockStatusCheck;