import { gql } from 'apollo-boost';

const addMember = ({ groupUri, userName, role }) => ({
    variables: {
        input: { groupUri, userName, role: role || 'Member' }
    },
    mutation: gql`mutation addGroupMember($input:NewGroupMemberInput){
            addGroupMember(input:$input){
                groupUri
                userRoleInGroup
                created
            }
        }`
});


export default addMember;
