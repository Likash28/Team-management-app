const Workspace = require('../models/workspaceModel');
const Member = require('../models/memberModel')
const { nanoid } = require('nanoid')

const createWorkspace = async (req, res) => {
    try {
        const { name } = req.body
        const workspace = await Workspace.create({
            name,
            owner: req.user._id,
            inviteCode: nanoid(10)
        })

        // workspace creator is given owner role by default
        await Member.create({
            user: req.user._id,
            workspace: workspace._id,
            role: 'owner',
            status: 'active'
        })

        res.status(201).json(workspace)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const joinWorkspace = async (req, res) => {
    const { inviteCode } = req.params
    const userId = req.user._id

    try {
        const workspace = await Workspace.findOne({ inviteCode })
        if (!workspace) {
            return res.status(404).json({ message: 'Invalid invite code' })
        }

        const alreadyMember = await Member.findOne({
            user: userId,
            workspace: workspace._id
        })

        if (alreadyMember) {
            return res.status(400).json({ message: 'You are already a member or have a pending request' })
        }

        // Create with status: 'pending'
        await Member.create({
            user: userId,
            workspace: workspace._id,
            role: 'member',
            status: 'pending'
        })

        res.status(200).json({ message: 'Join request sent. Waiting for admin approval.' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getInviteInfo = async (req, res) => {
    try {
        const { inviteCode } = req.params
        const workspace = await Workspace.findOne({ inviteCode }).select('name')

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" })
        }

        res.json(workspace)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getWorkspaceMembers = async (req, res) => {
    try {
        const { workspaceId } = req.params

        const members = await Member.find({ workspace: workspaceId })
            .populate('user', 'name email')

        res.status(201).json(members)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getUserWorkspaces = async (req, res) => {
    try {
        const memberships = await Member.find({
            user: req.user._id,
            //status: 'active'
            status: { $in: ['active', null, undefined] }
        }).populate({ path: 'workspace', model: 'Workspace' })

        const allWorkspaceIds = memberships.map(m => m.workspace._id)
        const uniqueMembers = await Member.distinct('user', {
            workspace: { $in: allWorkspaceIds }
        })

        const memberCount = await Promise.all(memberships.map(async (m) => {
            const workspace = m.workspace.toObject()

            const totalCount = await Member.countDocuments({ workspace: workspace._id })

            return { ...workspace, totalCount: totalCount }
        }))

        res.status(200).json({
            workspaces: memberCount,
            totalUniqueCollaborators: uniqueMembers.length
        })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const deleteWorkSpace = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const deletedWorkspace = await Workspace.findByIdAndDelete(workspaceId);

        if (!deletedWorkspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        await Member.deleteMany({ workspace: workspaceId });

        res.json({
            message: "Workspace and all associated members deleted successfully",
            id: workspaceId
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateWorkspace = async (req, res) => {
    try {
        const workSpace = await Workspace.findByIdAndUpdate(
            req.params.workspaceId,
            { name: req.body.name },
            { new: true }
        )
        res.json(workSpace)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updateMemberRole = async (req, res) => {
    try {
        const { workspaceId, memberId } = req.params
        const { newRole } = req.body

        const requester = await Member.findOne({
            workspace: workspaceId,
            user: req.user._id
        })

        const role = requester?.role?.toLowerCase()
        if (role !== 'admin' && role !== 'owner') {
            return res.status(403).json({ message: "Only Admins or Owners can change roles" })
        }

        const updatedMembership = await Member.findByIdAndUpdate(
            memberId,
            { role: newRole.toLowerCase() },
            { new: true }
        )

        if (!updatedMembership) {
            return res.status(404).json({ message: "Member record not found" })
        }

        res.status(200).json(updatedMembership)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const searchWorkspaceMembers = async (req, res) => {
    try {
        const { workspaceId } = req.params
        const { query } = req.query

        const members = await Member.find({ workspace: workspaceId })
            .populate({
                path: 'user',
                match: {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                },
                select: 'name email'
            })

        const filtered = members.filter(m => m.user !== null).map(m => m.user)

        res.status(200).json(filtered)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updateMemberStatus = async (req, res) => {
    try {
        const { workspaceId, memberId } = req.params
        const { action } = req.body

        const requester = await Member.findOne({ workspace: workspaceId, user: req.user._id })
        if (!requester || (requester.role !== 'admin' && requester.role !== 'owner')) {
            return res.status(403).json({ message: "Only admins can approve members" })
        }

        if (action === 'reject') {
            await Member.findByIdAndDelete(memberId)
            return res.status(200).json({ message: "Request rejected" })
        }

                const updatedMember = await Member.findByIdAndUpdate(
            memberId,
            { status: 'active' },
            { new: true }
        ).populate('user', 'name email')

        res.status(200).json(updatedMember)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    joinWorkspace,
    createWorkspace,
    getWorkspaceMembers,
    getUserWorkspaces,
    deleteWorkSpace,
    updateMemberRole,
    updateWorkspace,
    searchWorkspaceMembers,
    getInviteInfo,
    updateMemberStatus
}